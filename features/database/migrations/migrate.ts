import { migrate } from "drizzle-orm/postgres-js/pglite";
import { getDatabase } from "@/config/database";

export async function runMigrations() {
  const db = getDatabase();
  await migrate(db, { migrationsFolder: "./features/database/migrations" });
  console.log("Migrations completed");
}
