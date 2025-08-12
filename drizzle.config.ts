import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

export default defineConfig({
  schema: "./src/server/database/schemas/index.ts",
  out: "./src/server/database/migrations",
  dialect: "postgresql",
  casing: "snake_case",
  introspect: {
    casing: "camel",
  },
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
