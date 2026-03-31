# Phase 4: Database Layer

> Setting up DrizzleORM with PGlite for local development.

## Overview

This phase establishes the database layer with a type-safe ORM, local development database, and migration system.

## What You'll Learn

- Configuring DrizzleORM
- Setting up PGlite for local development
- Creating database schemas
- Running migrations
- Creating query utilities

## Prerequisites

- Phase 1-3 complete
- PostgreSQL (optional, for production)

## Steps

### 1. Install Dependencies

```bash
pnpm add drizzle-orm @electric-sql/pglite postgres
pnpm add -D drizzle-kit tsx
```

### 2. Configure Drizzle

Create `drizzle.config.ts`:

```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/features/database/models/schema.ts",
  out: "./src/features/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/pisky",
  },
} satisfies Config;
```

### 3. Create Database Connection

Create `src/config/database.ts`:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePGlite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import postgres from "postgres";
import * as schema from "../features/database/models/schema";

let client: postgres.Sql<{}> | PGlite | null = null;
let db: ReturnType<typeof drizzle> | ReturnType<typeof drizzlePGlite> | null = null;

export function getDatabase() {
  if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
    // Production: Use PostgreSQL
    if (!client) {
      client = postgres(process.env.DATABASE_URL);
      db = drizzle(client, { schema });
    }
    return db;
  } else {
    // Development: Use PGlite
    if (!client) {
      client = new PGlite("./local.db");
      db = drizzlePGlite(client as PGlite, { schema });
    }
    return db;
  }
}
```

### 4. Create Schema

Define tables in `src/features/database/models/schema.ts`:

```typescript
import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Infer types from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### 5. Generate and Run Migrations

```bash
# Generate migration from schema changes
pnpm db:generate

# Push schema to database
tsx src/features/database/push.ts

# Seed database
pnpm db:seed
```

### 6. Create Query Utilities

Build reusable query functions in `src/features/database/utils/queries.ts`:

```typescript
import { eq } from "drizzle-orm";
import { getDatabase } from "../../../config/database";
import { users, type User, type NewUser } from "../models/schema";

export async function getUserById(id: string): Promise<User | undefined> {
  const db = getDatabase();
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function createUser(data: NewUser): Promise<User> {
  const db = getDatabase();
  const result = await db.insert(users).values(data).returning();
  return result[0];
}
```

## Available Scripts

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `pnpm db:generate` | Generate migration from schema  |
| `pnpm db:push`     | Push schema changes to database |
| `pnpm db:studio`   | Open Drizzle Studio (GUI)       |
| `pnpm db:seed`     | Seed database with sample data  |

## Verification

```bash
# Check if seed worked
pnpm db:seed

# Expected output: "Database already seeded"
```

## Summary

Phase 4 adds:

- ✅ DrizzleORM configured
- ✅ PGlite for local development
- ✅ Database schema with users, sessions, accounts tables
- ✅ Migration system
- ✅ Query utilities

## Next Up

[Phase 5: Authentication](05-authentication.md)
