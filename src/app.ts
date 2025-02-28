import dotenv from "dotenv";
dotenv.config();
import startEventIndexer from "./indexer";
import "./server"; // This will start the Fastify server

// Start indexing events
startEventIndexer().catch((err) => {
  console.error("Error starting event indexer:", err);
});
