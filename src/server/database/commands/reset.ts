import "dotenv/config";
// Option 1: Wrap the database connection in an async function
import { confirm } from "@inquirer/prompts";
import { sql } from "drizzle-orm";

// Instead of top-level await, create an async function to get the database
const getDatabase = async () => {
  const { default: db } = await import("@/server/database");
  return db;
};

if (!("DATABASE_URL" in process.env))
  throw new Error("DATABASE_URL not found in .env");

const main = async () => {
  const db = await getDatabase(); // Get database connection here
  const databaseUrl = process.env.DATABASE_URL;
  const isRemoteDB = !(
    databaseUrl?.includes("localhost") || databaseUrl?.includes("127.0.0.1")
  );

  if (isRemoteDB) {
    console.info("⚠️  Be careful, You're dealing with a remote database.");
    const isConfirmed = await confirm({
      message: "Are you sure you want to clean the remote database?",
      default: false,
    });
    if (!isConfirmed) {
      console.info("❌ Operation aborted.");
      return;
    }
  }

  console.info("🌱 CLEANING STARTED");
  try {
    await db.transaction(async (tx) => {
      // Cloud-friendly database reset - no session_replication_role needed
      console.info("🧹 Dropping tables, sequences, and functions...");

      // Get all table names first to handle foreign key constraints
      const tables = await tx.execute(sql`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY tablename
      `);

      // Drop tables with CASCADE to handle foreign keys
      for (const table of tables.rows as { tablename: string }[]) {
        await tx.execute(
          sql.raw(`DROP TABLE IF EXISTS public."${table.tablename}" CASCADE`)
        );
        console.info(`  ✓ Dropped table: ${table.tablename}`);
      }

      // Drop sequences
      const sequences = await tx.execute(sql`
        SELECT sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
      `);

      for (const seq of sequences.rows as { sequencename: string }[]) {
        await tx.execute(
          sql.raw(
            `DROP SEQUENCE IF EXISTS public."${seq.sequencename}" CASCADE`
          )
        );
        console.info(`  ✓ Dropped sequence: ${seq.sequencename}`);
      }

      // Drop custom functions (skip built-in ones)
      const functions = await tx.execute(sql`
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc 
        INNER JOIN pg_namespace ns ON (pg_proc.pronamespace = ns.oid) 
        WHERE ns.nspname = 'public' 
        AND proname NOT LIKE 'pg_%'
      `);

      for (const func of functions.rows as {
        proname: string;
        argtypes: string;
      }[]) {
        try {
          await tx.execute(
            sql.raw(
              `DROP FUNCTION IF EXISTS public."${func.proname}"(${func.argtypes}) CASCADE`
            )
          );
          console.info(`  ✓ Dropped function: ${func.proname}`);
        } catch (e) {
          // Some functions might not be droppable, continue
          console.info(`  ⚠ Could not drop function: ${func.proname}`);
        }
      }

      // Drop custom types
      const types = await tx.execute(sql`
        SELECT typname 
        FROM pg_type 
        INNER JOIN pg_namespace ns ON (pg_type.typnamespace = ns.oid) 
        WHERE ns.nspname = 'public' 
        AND typtype = 'c'
        AND typname NOT LIKE 'pg_%'
      `);

      for (const type of types.rows as { typname: string }[]) {
        try {
          await tx.execute(
            sql.raw(`DROP TYPE IF EXISTS public."${type.typname}" CASCADE`)
          );
          console.info(`  ✓ Dropped type: ${type.typname}`);
        } catch (e) {
          console.info(`  ⚠ Could not drop type: ${type.typname}`);
        }
      }

      // Clean up Drizzle migration tables
      await tx.execute(
        sql`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE;`
      );
      await tx.execute(
        sql`DROP TABLE IF EXISTS "drizzle"."__drizzle_migrations" CASCADE;`
      );
      await tx.execute(sql`DROP SCHEMA IF EXISTS "drizzle" CASCADE;`);

      // Recreate public schema with permissions
      await tx.execute(sql`CREATE SCHEMA IF NOT EXISTS public;`);
      await tx.execute(sql`
        GRANT ALL ON SCHEMA public TO public;
        GRANT ALL ON ALL TABLES IN SCHEMA public TO public;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO public;
        GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO public;
      `);
    });

    console.info("✅ CLEANING COMPLETED");
    console.info("🌱 PUSHING DATABASE SCHEMA");
    console.info("\n🎉 DATABASE RESET SUCCESSFUL!");
  } catch (error: any) {
    console.error("Error clearing database:", error);

    const errorHandlers = {
      superuser: () => {
        console.error(
          "\n💡 SOLUTION: Your database user lacks superuser privileges."
        );
        console.error(
          "   This script has been updated to work without superuser privileges."
        );
      },
      permission: () => {
        console.error("\n💡 SOLUTION: Check your database user permissions.");
        console.error("   You may need database owner or admin privileges.");
      },
      connection: () => {
        console.error(
          "\n💡 SOLUTION: Check your DATABASE_URL and network connectivity."
        );
        console.error("   Ensure your database is running and accessible.");
      },
      replication: () => {
        console.error(
          "\n💡 SOLUTION: session_replication_role permission denied."
        );
        console.error(
          "   This is common with cloud databases. The script now avoids this."
        );
      },
    };

    if (error.message?.includes("must be a superuser")) {
      errorHandlers.superuser();
    } else if (error.message?.includes("permission denied")) {
      if (error.message.includes("session_replication_role")) {
        errorHandlers.replication();
      } else {
        errorHandlers.permission();
      }
    } else if (error.message?.includes("connection")) {
      errorHandlers.connection();
    }

    throw error;
  }
};

main()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(() => {
    if (process.env.NODE_ENV !== "test") {
      process.exit(0);
    }
  });
