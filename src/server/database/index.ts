import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../schemas";

const db = drizzle(process.env.DATABASE_URL, { schema });

export const connectDatabase = (callback: () => any) => {
  console.info("🌱 Connecting to database...");
  db.$client
    .connect()
    .then((db: any) => {
      console.info("🎉 Database connected successfully!");
      callback();
    })
    .catch((error: any) => {
      console.error("❌ Database connection error:", error);
      process.exit(1);
    });
};

export type Database = typeof db;
export default db;
