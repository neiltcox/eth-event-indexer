import fastify from "../server";
import { insertTransferEvent, getEvents, getStats, db } from "../db";

describe("Fastify server", () => {
  beforeAll(async () => {
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await db.run("DELETE FROM transfer_events");
  });

  test("GET /events should return a list of events", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/events",
    });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.json())).toBe(true);
  });

  test("GET /stats should return stats", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/stats",
    });

    expect(response.statusCode).toBe(200);
    const stats = response.json();
    expect(stats).toHaveProperty("totalEvents");
    expect(stats).toHaveProperty("totalValue");
  });

  test("Insert and retrieve a transfer event", async () => {
    const event = {
      from: "0x123",
      to: "0x456",
      value: "1000",
      transactionHash: "0x789",
      blockNumber: 1,
      timestamp: Date.now(),
    };

    await insertTransferEvent(event);

    const events = await getEvents({});
    expect(events.length).toBeGreaterThan(0);

    const insertedEvent = events.find(
      (e) => e.transactionHash === event.transactionHash
    );
    expect(insertedEvent).toMatchObject(event);
  });

  test("GET /events with query parameters should filter events", async () => {
    const event1 = {
      from: "0x123",
      to: "0x456",
      value: "1000",
      transactionHash: "0x789",
      blockNumber: 1,
      timestamp: Date.now(),
    };

    const event2 = {
      from: "0xabc",
      to: "0xdef",
      value: "2000",
      transactionHash: "0x101112",
      blockNumber: 2,
      timestamp: Date.now(),
    };

    await insertTransferEvent(event1);
    await insertTransferEvent(event2);

    const response = await fastify.inject({
      method: "GET",
      url: "/events?from=0x123",
    });

    expect(response.statusCode).toBe(200);
    const events = response.json();
    expect(events.length).toBe(1);
    expect(events[0].from).toBe("0x123");
  });
});
