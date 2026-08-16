import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@/database/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and configure it.");
}

const globalForDb = globalThis as unknown as { dbPool?: mysql.Pool };

const pool =
  globalForDb.dbPool ??
  mysql.createPool({
    uri: process.env.DATABASE_URL,
    connectionLimit: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbPool = pool;
}

export const db = drizzle(pool, { schema, mode: "default" });
