import "dotenv/config";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schemas";

class DatabaseManager {
  private static instance: NodePgDatabase<typeof schema> | null = null;
  private static pool: Pool | null = null;
  private static isInitializing = false;

  // Lazy initialization - only connects when first called
  static async getInstance(): Promise<NodePgDatabase<typeof schema>> {
    if (this.instance) {
      return this.instance;
    }

    // Prevent multiple simultaneous initializations
    if (this.isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.getInstance();
    }

    this.isInitializing = true;

    try {
      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL environment variable is required");
      }

      const isProduction = process.env.NODE_ENV === "production";

      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: isProduction ? 10 : 5,
        min: isProduction ? 2 : 0,
        idleTimeoutMillis: 60000,
        connectionTimeoutMillis: 10000,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
      });

      this.pool.on("error", (err) => {
        console.error("Database pool error:", err);
      });

      this.instance = drizzle(this.pool, {
        schema,
        logger: false,
        casing: "snake_case",
      });

      return this.instance;
    } finally {
      this.isInitializing = false;
    }
  }

  static async shutdown(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.end();
        this.instance = null;
        this.pool = null;
      } catch (error) {
        console.error("Error during shutdown:", error);
      }
    }
  }
}

const signals = ["SIGTERM", "SIGINT", "SIGUSR2"] as const;
signals.forEach((signal) => {
  process.once(signal, async () => {
    console.info(`Received ${signal}, shutting down...`);
    await DatabaseManager.shutdown();
    process.exit(0);
  });
});

export const db = await DatabaseManager.getInstance();
export type Database = Awaited<ReturnType<typeof DatabaseManager.getInstance>>;
export default db;
