# Phase 3: Core Infrastructure Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan.

**Goal:** Configure T3 Env for type-safe environment variables, setup LogTape logging, and create utility functions.

**Architecture:** Establish core infrastructure services that other features will depend on. Centralized configuration, logging, and utilities.

**Tech Stack:** T3 Env, LogTape, TypeScript utilities

**NJB Reference:** Check `/home/acn/acn/Next-js-Boilerplate/src/env.js` and `/home/acn/acn/Next-js-Boilerplate/src/libs/LogTape.ts`

---

### Task 1: Install and Configure T3 Env

**Files:**
- Create: `src/config/env.ts`
- Create: `.env.example`
- Modify: `package.json`

- [ ] **Step 1: Check NJB env configuration**

```bash
cat /home/acn/acn/Next-js-Boilerplate/src/env.js
```

- [ ] **Step 2: Install T3 Env**

```bash
npm install @t3-oss/env-nextjs
```

- [ ] **Step 3: Create env schema**

```bash
cat > src/config/env.ts << 'EOF'
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: z.string().url().optional(),
    // Auth (for Phase 5)
    AUTH_SECRET: z.string().min(1).optional(),
    // Monitoring (for Phase 8)
    SENTRY_DSN: z.string().url().optional(),
  },
  client: {
    // Client-side env vars
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    SENTRY_DSN: process.env.SENTRY_DSN,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
EOF
```

- [ ] **Step 4: Create .env.example**

```bash
cat > .env.example << 'EOF'
# Node Environment
NODE_ENV=development

# Database (Phase 4)
DATABASE_URL=""

# Auth (Phase 5)
AUTH_SECRET=""

# Monitoring (Phase 8)
SENTRY_DSN=""

# Skip env validation (development only)
SKIP_ENV_VALIDATION=""
EOF
```

- [ ] **Step 5: Commit env configuration**

```bash
git add .
git commit -m "feat: configure T3 Env for type-safe environment variables"
```

---

### Task 2: Setup LogTape Logging

**Files:**
- Create: `src/config/logging.ts`
- Create: `src/shared/utils/logger.ts`

- [ ] **Step 1: Check NJB LogTape configuration**

```bash
cat /home/acn/acn/Next-js-Boilerplate/src/libs/LogTape.ts
```

- [ ] **Step 2: Install LogTape**

```bash
npm install logtape
```

- [ ] **Step 3: Create LogTape configuration**

```bash
cat > src/config/logging.ts << 'EOF'
import { configure, getLogger } from "logtape";

export function setupLogging() {
  configure({
    namespace: "pisky",
    sinks: {
      console: {
        category: "console",
        sink: (record) => {
          const level = record.level.toLowerCase();
          const message = `${record.timestamp.toISOString()} [${record.categoryName}] ${level}: ${record.message}`;
          switch (level) {
            case "error":
              console.error(message);
              break;
            case "warning":
              console.warn(message);
              break;
            default:
              console.log(message);
          }
        },
      },
    },
    loggers: {
      default: {
        category: "default",
        sinks: ["console"],
        level: process.env.LOG_LEVEL || "info",
      },
    },
  });
}

export function getLogger(category: string) {
  return getLogger({ category });
}
EOF
```

- [ ] **Step 4: Create logger utility**

```bash
cat > src/shared/utils/logger.ts << 'EOF'
import { getLogger } from "@/config/logging";

export const logger = getLogger("app");
export const dbLogger = getLogger("database");
export const authLogger = getLogger("auth");
export const apiLogger = getLogger("api");
EOF
```

- [ ] **Step 5: Initialize logging in root layout**

```bash
cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { ThemeProvider } from "@/shared/components/theme-provider";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { setupLogging } from "@/config/logging";

// Initialize logging
setupLogging();

export const metadata: Metadata = {
  title: "Pisky Boilerplate",
  description: "A personalized Next.js 16+ boilerplate",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header>
            <ThemeToggle />
          </Header>
          <main className="min-h-[calc(100vh-8rem)]">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
EOF
```

- [ ] **Step 6: Commit logging setup**

```bash
git add .
git commit -m "feat: configure LogTape for structured logging"
```

---

### Task 3: Create Utility Functions

**Files:**
- Create: `src/shared/utils/date.ts`
- Create: `src/shared/utils/number.ts`
- Modify: `src/shared/utils/cn.ts` (already exists)

- [ ] **Step 1: Create date utilities**

```bash
cat > src/shared/utils/date.ts << 'EOF'
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}
EOF
```

- [ ] **Step 2: Create number utilities**

```bash
cat > src/shared/utils/number.ts << 'EOF'
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatCurrency(num: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(num);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
EOF
```

- [ ] **Step 3: Create string utilities**

```bash
cat > src/shared/utils/string.ts << 'EOF'
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function generateId(length = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}
EOF
```

- [ ] **Step 4: Create utility barrel export**

```bash
cat > src/shared/utils/index.ts << 'EOF'
export * from "./cn";
export * from "./date";
export * from "./number";
export * from "./string";
export * from "./logger";
EOF
```

- [ ] **Step 5: Commit utility functions**

```bash
git add .
git commit -m "feat: add utility functions for date, number, and string formatting"
```

---

### Task 4: Create Type Definitions

**Files:**
- Create: `src/shared/types/common.ts`
- Create: `src/shared/types/api.ts`

- [ ] **Step 1: Create common types**

```bash
cat > src/shared/types/common.ts << 'EOF'
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type SortOrder = "asc" | "desc";

export type SortableField<T> = keyof T;
EOF
```

- [ ] **Step 2: Create API types**

```bash
cat > src/shared/types/api.ts << 'EOF'
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiError = {
  code: string;
  message: string;
  status: number;
};
EOF
```

- [ ] **Step 3: Create types barrel export**

```bash
cat > src/shared/types/index.ts << 'EOF'
export * from "./common";
export * from "./api";
EOF
```

- [ ] **Step 4: Commit type definitions**

```bash
git add .
git commit -m "feat: add common and API type definitions"
```

---

### Task 5: Create Configuration Exports

**Files:**
- Create: `src/config/index.ts`

- [ ] **Step 1: Create config barrel export**

```bash
cat > src/config/index.ts << 'EOF'
export * from "./env";
export * from "./logging";
EOF
```

- [ ] **Step 2: Commit config exports**

```bash
git add src/config/index.ts
git commit -m "chore: add config barrel export"
```

---

### Task 6: Update Documentation

**Files:**
- Create: `docs/tutorial/03-core-infrastructure.md`
- Modify: `README.md`

- [ ] **Step 1: Create Phase 3 tutorial**

```bash
cat > docs/tutorial/03-core-infrastructure.md << 'EOF'
# Phase 3: Core Infrastructure

> Setting up type-safe environment variables, structured logging, and utility functions.

## Overview

This phase establishes core infrastructure that other features depend on.

## What You'll Learn

- Type-safe environment variables with T3 Env
- Structured logging with LogTape
- Creating reusable utility functions
- Shared type definitions

## Prerequisites

- Phase 1-2 complete

## Steps

### 1. Configure T3 Env

Define environment schema with Zod validation:

\`\`\`typescript
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]),
    DATABASE_URL: z.string().url().optional(),
  },
  // ...
});
\`\`\`

### 2. Setup LogTape

Configure structured logging:

\`\`\`typescript
configure({
  sinks: { console: /* ... */ },
  loggers: { default: /* ... */ },
});
\`\`\`

### 3. Create Utilities

Build reusable functions for dates, numbers, strings.

### 4. Define Types

Create shared types for API responses, pagination, etc.

## Verification

\`\`\`bash
npm run build
npm run dev
\`\`\`

## Summary

Phase 3 adds:
- ✅ T3 Env configuration
- ✅ LogTape logging
- ✅ Utility functions
- ✅ Shared types

## Next Up

[Phase 4: Database Layer](04-database-layer.md)
EOF
```

- [ ] **Step 2: Update progress tracker**

```bash
sed -i '/Phase 3: Core Infrastructure/,/Status:/s/Status: \[ \] Not Started/Status: [x] Complete/' docs/PROGRESS.md
```

- [ ] **Step 3: Commit documentation**

```bash
git add .
git commit -m "docs: add Phase 3 tutorial"
```

---

### Task 7: Final Verification

- [ ] **Step 1: Run all checks**

```bash
npm run lint
npm run build
```

- [ ] **Step 2: Create Phase 3 tag**

```bash
git tag -a phase-3-infrastructure -m "Phase 3: Core Infrastructure complete"
```

---

## Summary

Phase 3 establishes core infrastructure:
- ✅ T3 Env for type-safe env vars
- ✅ LogTape for structured logging
- ✅ Utility functions created
- ✅ Shared type definitions

## Next Steps

Proceed to Phase 4: Database Layer
