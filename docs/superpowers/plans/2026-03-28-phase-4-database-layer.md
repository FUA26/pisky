# Phase 4: Database Layer Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan.

**Goal:** Install DrizzleORM, setup PGlite for local development, configure Drizzle Kit, and create base schema with migrations.

**Architecture:** Establish database layer with type-safe ORM, local development database, and migration system.

**Tech Stack:** DrizzleORM, PGlite, Drizzle Kit

**NJB Reference:** Check `/home/acn/acn/Next-js-Boilerplate/src/models/Schema.ts`, `/home/acn/acn/Next-js-Boilerplate/drizzle.config.ts`, `/home/acn/acn/Next-js-Boilerplate/src/libs/PGlite.ts`

---

### Task 1: Install DrizzleORM and Dependencies

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Check NJB database setup**

```bash
cat /home/acn/acn/Next-js-Boilerplate/package.json | grep -E "drizzle|pglite"
```

- [ ] **Step 2: Install DrizzleORM core packages**

```bash
npm install drizzle-orm
npm install --save-dev drizzle-kit
```

- [ ] **Step 3: Install PGlite for local development**

```bash
npm install @electric-sql/pglite
```

- [ ] **Step 4: Install PostgreSQL driver (for production)**

```bash
npm install postgres
```

- [ ] **Step 5: Commit installations**

```bash
git add package.json package-lock.json
git commit -m "feat: install DrizzleORM and PGlite dependencies"
```

---

### Task 2: Configure Drizzle

**Files:**

- Create: `drizzle.config.ts`
- Create: `src/config/database.ts`

- [ ] **Step 1: Check NJB Drizzle config**

```bash
cat /home/acn/acn/Next-js-Boilerplate/drizzle.config.ts
```

- [ ] **Step 2: Create Drizzle configuration**

```bash
cat > drizzle.config.ts << 'EOF'
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/features/database/models/schema.ts",
  out: "./src/features/database/migrations",
  driver: "pglite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "./local.db",
  },
} satisfies Config;
EOF
```

- [ ] **Step 3: Create database connection utility**

```bash
cat > src/config/database.ts << 'EOF`
import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePGlite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import postgres from "postgres";
import * as schema from "./database/models/schema";

let client: postgres.Sql | PGlite;
let db: ReturnType<typeof drizzle | typeof drizzlePGlite>;

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
      db = drizzlePGlite(client, { schema });
    }
    return db;
  }
}
EOF
```

- [ ] **Step 4: Add database scripts to package.json**

```bash
npm pkg set scripts.db:generate="drizzle-kit generate"
npm pkg set scripts.db:migrate="drizzle-kit migrate"
npm pkg set scripts.db:push="drizzle-kit push"
npm pkg set scripts.db:studio="drizzle-kit studio"
```

- [ ] **Step 5: Commit Drizzle configuration**

```bash
git add drizzle.config.ts src/config/database.ts package.json package-lock.json
git commit -m "feat: configure DrizzleORM with PGlite"
```

---

### Task 3: Create Database Schema

**Files:**

- Create: `src/features/database/models/schema.ts`
- Create: `src/features/database/models/index.ts`

- [ ] **Step 1: Check NJB schema for reference**

```bash
cat /home/acn/acn/Next-js-Boilerplate/src/models/Schema.ts
```

Note: NJB uses Clerk-based user schema, we'll adapt for NextAuth

- [ ] **Step 2: Create base schema with User table**

```bash
cat > src/features/database/models/schema.ts << 'EOF'
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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
EOF
```

- [ ] **Step 3: Create schema export**

```bash
cat > src/features/database/models/index.ts << 'EOF'
export * from "./schema";
EOF
```

- [ ] **Step 4: Update config/database.ts to import schema**

```bash
cat > src/config/database.ts << 'EOF'
import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePGlite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import postgres from "postgres";
import * as schema from "../features/database/models/schema";

let client: postgres.Sql | PGlite;
let db: ReturnType<typeof drizzle | typeof drizzlePGlite>;

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
      db = drizzlePGlite(client, { schema });
    }
    return db;
  }
}
EOF
```

- [ ] **Step 5: Commit schema**

```bash
git add src/features/database/models/ src/config/database.ts
git commit -m "feat: create base database schema with users table"
```

---

### Task 4: Setup Migration System

**Files:**

- Create: `src/features/database/migrations/.gitkeep`
- Create: `src/features/database/migrations/migrate.ts`

- [ ] **Step 1: Create migration utility**

```bash
cat > src/features/database/migrations/migrate.ts << 'EOF'
import { migrate } from "drizzle-orm/postgres-js/pglite";
import { getDatabase } from "@/config/database";

export async function runMigrations() {
  const db = getDatabase();
  await migrate(db, { migrationsFolder: "./src/features/database/migrations" });
  console.log("Migrations completed");
}
EOF
```

- [ ] **Step 2: Generate initial migration**

```bash
npm run db:generate
```

Expected: Migration files created in migrations folder

- [ ] **Step 3: Create seed script**

```bash
cat > src/features/database/seed/seed.ts << 'EOF'
import { getDatabase } from "@/config/database";
import { users } from "../models/schema";

export async function seed() {
  const db = getDatabase();

  // Check if already seeded
  const existing = await db.select().from(users).limit(1);
  if (existing.length > 0) {
    console.log("Database already seeded");
    return;
  }

  // Add seed data
  await db.insert(users).values({
    name: "Demo User",
    email: "demo@example.com",
    emailVerified: true,
  });

  console.log("Database seeded successfully");
}
EOF
```

- [ ] **Step 4: Add seed script to package.json**

```bash
npm pkg set scripts.db:seed="tsx src/features/database/seed/seed.ts"
```

- [ ] **Step 5: Install tsx for running TypeScript**

```bash
npm install --save-dev tsx
```

- [ ] **Step 6: Commit migration system**

```bash
git add .
git commit -m "feat: setup migration system and seed script"
```

---

### Task 5: Create Database Utilities

**Files:**

- Create: `src/features/database/utils/queries.ts`
- Create: `src/features/database/utils/index.ts`

- [ ] **Step 1: Create user query utilities**

```bash
cat > src/features/database/utils/queries.ts << 'EOF'
import { eq } from "drizzle-orm";
import { getDatabase } from "@/config/database";
import { users, type User, type NewUser } from "../models/schema";

export async function getUserById(id: string): Promise<User | undefined> {
  const db = getDatabase();
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = getDatabase();
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function createUser(data: NewUser): Promise<User> {
  const db = getDatabase();
  const result = await db.insert(users).values(data).returning();
  return result[0];
}

export async function updateUser(id: string, data: Partial<NewUser>): Promise<User | undefined> {
  const db = getDatabase();
  const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
  return result[0];
}

export async function deleteUser(id: string): Promise<void> {
  const db = getDatabase();
  await db.delete(users).where(eq(users.id, id));
}
EOF
```

- [ ] **Step 2: Create database utilities export**

```bash
cat > src/features/database/utils/index.ts << 'EOF'
export * from "./queries";
EOF
```

- [ ] **Step 3: Commit database utilities**

```bash
git add src/features/database/utils/
git commit -m "feat: add database query utilities"
```

---

### Task 6: Create Feature Exports

**Files:**

- Create: `src/features/database/index.ts`

- [ ] **Step 1: Create database feature barrel export**

```bash
cat > src/features/database/index.ts << 'EOF'
export * from "./models";
export * from "./utils";
export * from "./migrations/migrate";
export * from "./seed/seed";
EOF
```

- [ ] **Step 2: Commit exports**

```bash
git add src/features/database/index.ts
git commit -m "chore: add database feature barrel export"
```

---

### Task 7: Update Documentation

**Files:**

- Create: `docs/tutorial/04-database-layer.md`

- [ ] **Step 1: Create Phase 4 tutorial**

```bash
cat > docs/tutorial/04-database-layer.md << 'EOF'
# Phase 4: Database Layer

> Setting up DrizzleORM with PGlite for local development.

## Overview

This phase establishes the database layer with a type-safe ORM.

## What You'll Learn

- Configuring DrizzleORM
- Setting up PGlite for local development
- Creating database schemas
- Running migrations
- Creating query utilities

## Prerequisites

- Phase 1-3 complete

## Steps

### 1. Install Dependencies

\`\`\`bash
npm install drizzle-orm @electric-sql/pglite postgres
npm install --save-dev drizzle-kit
\`\`\`

### 2. Configure Drizzle

Create \`drizzle.config.ts\` and database connection utility.

### 3. Create Schema

Define tables using Drizzle schema:

\`\`\`typescript
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  // ...
});
\`\`\`

### 4. Run Migrations

\`\`\`bash
npm run db:generate
npm run db:push
\`\`\`

### 5. Create Query Utilities

Build reusable query functions for common operations.

## Verification

\`\`\`bash
npm run db:studio
# Browse database at http://local.drizzle.studio
\`\`\`

## Summary

Phase 4 adds:
- ✅ DrizzleORM configured
- ✅ PGlite for local development
- ✅ Database schema created
- ✅ Migration system setup
- ✅ Query utilities

## Next Up

[Phase 5: Authentication](05-authentication.md)
EOF
```

- [ ] **Step 2: Update progress tracker and commit**

```bash
sed -i '/Phase 4: Database Layer/,/Status:/s/Status: \[ \] Not Started/Status: [x] Complete/' docs/PROGRESS.md
git add .
git commit -m "docs: add Phase 4 tutorial"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Test database connection**

```bash
npm run db:push
```

Expected: Database schema pushed successfully

- [ ] **Step 2: Run seed script**

```bash
npm run db:seed
```

Expected: Database seeded

- [ ] **Step 3: Create Phase 4 tag**

```bash
git tag -a phase-4-database -m "Phase 4: Database Layer complete"
```

---

## Summary

Phase 4 establishes the database layer:

- ✅ DrizzleORM configured
- ✅ PGlite for local development
- ✅ Database schema with users table
- ✅ Migration system
- ✅ Query utilities

## Next Steps

Proceed to Phase 5: Authentication
