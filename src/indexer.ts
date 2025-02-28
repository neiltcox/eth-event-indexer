import { JsonRpcProvider, Contract, EventLog } from "ethers";
import { insertTransferEvent } from "./db";

// Replace with your Ethereum RPC endpoint (e.g., Infura or Alchemy)
const provider = new JsonRpcProvider(process.env.RPC_URL);

// USDC contract address on Sepolia (as provided)
const contractAddress = "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238";

// ERC-20 Transfer event ABI
const abi = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];
const contract = new Contract(contractAddress, abi, provider);

// Optionally, set a starting block
const startBlock = Number(process.env.START_BLOCK || 0);

async function startEventIndexer() {
  try {
    // If you need to catch up from a starting block:
    const currentBlock = await provider.getBlockNumber();
    console.log(`Indexing events from block ${startBlock} to ${currentBlock}`);

    const events = await contract.queryFilter(
      "Transfer",
      startBlock,
      currentBlock
    );
    for (const event of events) {
      const typedEvent = event as EventLog;
      const { from, to, value } = typedEvent.args!;
      const { transactionHash, blockNumber } = event;
      // Fetch the block timestamp
      const block = await provider.getBlock(blockNumber);
      if (!block) {
        console.error(`Block ${blockNumber} not found.`);
        return;
      }
      const timestamp = block.timestamp;

      // Save event to database
      await insertTransferEvent({
        from,
        to,
        value: value.toString(),
        transactionHash,
        blockNumber,
        timestamp,
      });

      console.log(
        `Indexed past event: ${from}, ${to}, ${value.toString()}, ${transactionHash}, ${blockNumber}, ${timestamp}`
      );
    }

    // Listen for new events in real time
    contract.on("Transfer", async (from, to, value, event) => {
      try {
        const block = await provider.getBlock(event.blockNumber);
        if (!block) {
          console.error(`Block ${event.blockNumber} not found.`);
          return;
        }
        const timestamp = block.timestamp;

        await insertTransferEvent({
          from,
          to,
          value: value.toString(),
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
          timestamp,
        });

        console.log(
          `Indexed live event: ${from}, ${to}, ${value.toString()}, ${
            event.log.transactionHash
          }, ${event.log.blockNumber}, ${timestamp}`
        );
      } catch (error) {
        console.error(
          `Error processing live event: ${(error as Error).message}`
        );
      }
    });
  } catch (error) {
    console.error(`Error starting event indexer: ${(error as Error).message}`);
  }
}

export default startEventIndexer;
