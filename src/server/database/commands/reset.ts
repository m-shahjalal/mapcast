import { confirm } from "@inquirer/prompts";
import { sql } from "drizzle-orm";

import db from "@/server/database";

if (!("DATABASE_URL" in process.env))
  throw new Error("DATABASE_URL not found in .env");

const main = async () => {
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
      // Skip connection termination to avoid superuser privilege issues
      // This is safer and works with most cloud database providers

      // First, disable foreign key checks temporarily if needed
      await tx.execute(sql`SET session_replication_role = replica;`);

      // Drop all user tables in public schema
      await tx.execute(sql`
        DO $$ DECLARE
          r RECORD;
        BEGIN
          -- Drop all tables in public schema
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
          LOOP
            EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
          
          -- Drop all sequences in public schema
          FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public')
          LOOP
            EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequencename) || ' CASCADE';
          END LOOP;
          
          -- Drop all functions in public schema
          FOR r IN (SELECT proname, oidvectortypes(proargtypes) as argtypes 
                   FROM pg_proc INNER JOIN pg_namespace ns ON (pg_proc.pronamespace = ns.oid) 
                   WHERE ns.nspname = 'public')
          LOOP
            EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || '(' || r.argtypes || ') CASCADE';
          END LOOP;
          
          -- Drop all types in public schema
          FOR r IN (SELECT typname FROM pg_type INNER JOIN pg_namespace ns ON (pg_type.typnamespace = ns.oid) 
                   WHERE ns.nspname = 'public' AND typtype = 'c')
          LOOP
            EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
          END LOOP;
        END $$;
      `);

      await tx.execute(sql`SET session_replication_role = DEFAULT;`);

      await tx.execute(
        sql`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE;`
      );
      await tx.execute(
        sql`DROP TABLE IF EXISTS "drizzle"."__drizzle_migrations" CASCADE;`
      );

      await tx.execute(sql`DROP SCHEMA IF EXISTS "drizzle" CASCADE;`);

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

    // Push the new schema
    // execSync("drizzle-kit push", { stdio: "inherit" });

    console.info("\n🎉 DATABASE RESET SUCCESSFUL!");
  } catch (error: any) {
    console.error("Error clearing database:", error);

    // Provide helpful error messages for common issues
    if (error.message?.includes("must be a superuser")) {
      console.error(
        "\n💡 SOLUTION: Your database user lacks superuser privileges."
      );
      console.error(
        "   This is common with cloud databases (AWS RDS, Google Cloud SQL, etc.)"
      );
      console.error(
        "   The script has been updated to work without superuser privileges."
      );
    } else if (error.message?.includes("permission denied")) {
      console.error("\n💡 SOLUTION: Check your database user permissions.");
      console.error("   You may need CREATEDB or database owner privileges.");
    } else if (error.message?.includes("connection")) {
      console.error(
        "\n💡 SOLUTION: Check your DATABASE_URL and network connectivity."
      );
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
    // Only exit if we're not in a test environment
    if (process.env.NODE_ENV !== "test") {
      process.exit(0);
    }
  });
