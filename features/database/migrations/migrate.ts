import { getDatabase } from "@/config/database";

export async function runMigrations() {
  const db = getDatabase();
  if (!db) throw new Error("Database not available");
  // Migrations are handled by drizzle-kit CLI
  // Use: pnpm db:generate or pnpm db:push
  console.log("Migrations are managed via drizzle-kit CLI");
}
