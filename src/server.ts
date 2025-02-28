// src/server.ts
import Fastify from "fastify";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { getEvents, getStats } from "./db";

const fastify = Fastify({ logger: true });

fastify.register(helmet);
fastify.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

fastify.get("/events", async (request, reply) => {
  const { from, to, startBlock, endBlock, page, pageSize } = request.query as {
    from?: string;
    to?: string;
    startBlock?: string;
    endBlock?: string;
    page?: string;
    pageSize?: string;
  };

  const events = await getEvents({
    from,
    to,
    startBlock: startBlock ? Number(startBlock) : undefined,
    endBlock: endBlock ? Number(endBlock) : undefined,
    page: page ? Number(page) : 1,
    pageSize: pageSize ? Number(pageSize) : 10,
  });
  return events;
});

fastify.get("/stats", async (request, reply) => {
  const stats = await getStats();
  return stats;
});

const startServer = async () => {
  try {
    await fastify.listen({
      port: Number(process.env.PORT) || 3000,
      host: "0.0.0.0",
    });
    fastify.log.info(`Server running on ${fastify.server.address()}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();

export default fastify;
