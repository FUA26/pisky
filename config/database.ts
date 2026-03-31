import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePGlite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import postgres from "postgres";
import * as schema from "@/features/database/models/schema";

let client: postgres.Sql<{}> | PGlite | null = null;
let db: ReturnType<typeof drizzle> | ReturnType<typeof drizzlePGlite> | null = null;

export function getDatabase() {
  // Use PostgreSQL if DATABASE_URL is set (production or remote dev)
  if (process.env.DATABASE_URL) {
    if (!client) {
      client = postgres(process.env.DATABASE_URL);
      db = drizzle(client, { schema });
    }
    return db;
  } else {
    // Fallback to PGlite for local development without DATABASE_URL
    if (!client) {
      client = new PGlite("./local.db");
      db = drizzlePGlite(client as PGlite, { schema });
    }
    return db;
  }
}
