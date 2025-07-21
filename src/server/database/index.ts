import "dotenv/config";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schemas";

const db = drizzle(process.env.DATABASE_URL, { schema });

export const connectDatabase = (callback: () => any) => {
  db.$client
    .connect()
    .then(() => {
      console.info("🎉 Database connected successfully");
      callback();
    })
    .catch((error: any) => {
      console.error("❌ Database connection error:", error);
      process.exit(1);
    });
};

export type Database = NodePgDatabase<typeof schema>;
export default db;
