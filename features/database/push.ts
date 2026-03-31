import { drizzle as drizzlePGlite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./models/schema";
import { readFileSync } from "fs";
import { join } from "path";

async function pushSchema() {
  const client = new PGlite("./local.db");
  const db = drizzlePGlite(client, { schema });

  // Read the latest migration file
  const migrationPath = join(__dirname, "migrations", "0001_many_fallen_one.sql");
  const migrationSQL = readFileSync(migrationPath, "utf-8");

  // Execute the migration
  await client.exec(migrationSQL);

  console.log("Migration applied successfully");

  await client.close();
}

pushSchema().catch(console.error);
