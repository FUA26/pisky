# Phase 3: Core Infrastructure

> Setting up type-safe environment variables, structured logging, and utility functions.

## Overview

This phase establishes core infrastructure that other features will depend on.

## What You'll Learn

- Type-safe environment variables with T3 Env
- Structured logging
- Creating reusable utility functions
- Shared type definitions

## Prerequisites

- Phase 1-2 complete

## Steps

### 1. Configure T3 Env

Define environment schema with Zod validation:

\`\`\`typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
server: {
NODE_ENV: z.enum(["development", "production"]),
DATABASE_URL: z.string().url().optional(),
},
client: {
NEXT_PUBLIC_APP_URL: z.string().url().optional(),
},
runtimeEnv: {
// Map to process.env
},
});
\`\`\`

### 2. Setup Logging

Create a simple logger utility:

\`\`\`typescript
class Logger {
debug(message: string, data?: unknown) { /_ ... _/ }
info(message: string, data?: unknown) { /_ ... _/ }
warn(message: string, data?: unknown) { /_ ... _/ }
error(message: string, data?: unknown) { /_ ... _/ }
}
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
- ✅ Logger utility
- ✅ Utility functions (date, number, string)
- ✅ Shared types (common, API)

## Next Up

[Phase 4: Database Layer](04-database-layer.md)
