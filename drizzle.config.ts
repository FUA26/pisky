import type { Config } from "drizzle-kit";

export default {
  schema: "./features/database/models/schema.ts",
  out: "./features/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
