import fs from "fs";
import Database from "better-sqlite3";
import { and, eq, gte, lte, sql, desc, SQL } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { drizzle } from "drizzle-orm/better-sqlite3";

// Define schema
export const transferEvents = sqliteTable("transfer_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  from: text("from").notNull(),
  to: text("to").notNull(),
  value: text("value").notNull(),
  transactionHash: text("transactionHash").notNull().unique(),
  blockNumber: integer("blockNumber").notNull(),
  timestamp: integer("timestamp").notNull(),
});

// Initialize database
const dbFilePath = "./data/events.db";

if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data", { recursive: true });
}

const sqlite = new Database(dbFilePath);
export const db = drizzle(sqlite, { schema: { transferEvents } });

export async function initDb() {
  await db.run(sql`CREATE TABLE IF NOT EXISTS transfer_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    value TEXT NOT NULL,
    transactionHash TEXT NOT NULL UNIQUE,
    blockNumber INTEGER NOT NULL,
    timestamp INTEGER NOT NULL
  );`);
  console.log("Database initialized");
}

initDb().catch(console.error);

// Insert event
export async function insertTransferEvent(event: {
  from: string;
  to: string;
  value: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
}) {
  try {
    await db.insert(transferEvents).values(event).onConflictDoNothing();
  } catch (error) {
    console.error("Error inserting transfer event:", error);
  }
}

export async function getEvents({
  from,
  to,
  startBlock,
  endBlock,
  page = 1,
  pageSize = 10,
}: {
  from?: string;
  to?: string;
  startBlock?: number;
  endBlock?: number;
  page?: number;
  pageSize?: number;
}) {
  // Collect conditions dynamically
  const conditions: SQL[] = [];

  if (from) conditions.push(eq(transferEvents.from, from));
  if (to) conditions.push(eq(transferEvents.to, to));
  if (startBlock !== undefined)
    conditions.push(gte(transferEvents.blockNumber, startBlock));
  if (endBlock !== undefined)
    conditions.push(lte(transferEvents.blockNumber, endBlock));

  // Execute query
  return db
    .select()
    .from(transferEvents)
    .where(conditions.length > 0 ? and(...conditions) : undefined) // Avoids passing empty `where()`
    .orderBy(desc(transferEvents.blockNumber))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}

// Get stats
export async function getStats() {
  const totalEvents = await db
    .select({ count: sql<number>`count(*)` })
    .from(transferEvents)
    .then((res) => res[0]?.count ?? 0);

  const totalValue = await db
    .select({
      total: sql<number>`sum(cast(${transferEvents.value} as INTEGER))`,
    })
    .from(transferEvents)
    .then((res) => res[0]?.total ?? 0);

  return { totalEvents, totalValue };
}
