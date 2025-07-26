import "dotenv/config";
import {
  drizzle,
  type NodePgClient,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "./schemas";

// Environment configuration helper
const getEnvConfig = () => {
  const DATABASE_URL = process.env.DATABASE_URL;
  const NODE_ENV = process.env.NODE_ENV || "development";

  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  return { DATABASE_URL, NODE_ENV };
};

// Create optimized pool configuration
const createPoolConfig = (env: string, DATABASE_URL: string): PoolConfig => ({
  connectionString: DATABASE_URL,
  max: env === "production" ? 10 : 5,
  min: env === "production" ? 2 : 0,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 60000,
  // Uncomment and configure SSL if needed
  // ssl: env === 'production' ? { rejectUnauthorized: true } : false,
});

// Database singleton
class DatabaseManager {
  private static instance:
    | (NodePgDatabase<typeof schema> & { $client: NodePgClient })
    | null;

  private constructor() {}

  static getInstance(): NodePgDatabase<typeof schema> & {
    $client: NodePgClient;
  } {
    if (!this.instance) {
      const { NODE_ENV, DATABASE_URL } = getEnvConfig();
      const poolConfig = createPoolConfig(NODE_ENV, DATABASE_URL);
      const pool = new Pool(poolConfig);

      // Centralized error handling
      pool.on("error", (err) => {
        console.error("Unhandled database pool error:", err);
        process.exit(1);
      });

      this.instance = drizzle(pool, {
        schema,
        logger: false,
        casing: "snake_case",
      });
      // consola.log('Database instance created');
    }

    // consola.log('Database instance returned');

    return this.instance;
  }

  // Graceful shutdown method
  static async shutdown(): Promise<void> {
    if (this.instance && this.instance.$client instanceof Pool) {
      try {
        // console.log('Closing database pool...');
        await this.instance.$client.end();
        this.instance = null;
      } catch (error) {
        console.error("Error during database pool shutdown:", error);
      }
    }
  }
}

// Export database instance
export const db = DatabaseManager.getInstance();
export type Database = typeof db;

// Setup graceful shutdown handlers
const setupShutdownHandlers = () => {
  const signals = [
    "SIGTERM", // Standard termination
    "SIGINT", // Interrupt (Ctrl+C)
    "SIGUSR2", // Nodemon restart signal
    "SIGQUIT", // Quit program
  ];

  for (const signal of signals) {
    process.once(signal, async () => {
      console.info(`Received ${signal}, initiating graceful shutdown...`);

      try {
        await DatabaseManager.shutdown();
        console.info("Database connections closed");
      } catch (error) {
        console.error("Shutdown error:", error);
      }

      process.exit(signal === "SIGQUIT" ? 1 : 0);
    });
  }
};

setupShutdownHandlers();

export default db;
