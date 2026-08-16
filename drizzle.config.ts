import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and configure it.");
}

export default defineConfig({
  schema: "./database/schema/index.ts",
  out: "./database/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
