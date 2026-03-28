# Phase 2: Styling System

> Setting up Tailwind CSS 4 with flexible theming and Shadcn UI components.

## Overview

This phase covers setting up a flexible styling system with Tailwind CSS 4 and Shadcn UI.

## What You'll Learn

- Upgrading to Tailwind CSS 4
- Configuring CSS variables for flexible theming
- Setting up Shadcn UI
- Creating shared layout components
- Implementing dark mode support

## Prerequisites

- Phase 1: Project Foundation complete

## Steps

### 1. Install Shadcn UI Dependencies

\`\`\`bash
pnpm add class-variance-authority lucide-react tailwind-merge
\`\`\`

### 2. Initialize Shadcn UI

\`\`\`bash
npx shadcn@latest init
\`\`\`

Configure \`components.json\`:

\`\`\`json
{
"aliases": {
"components": "@/shared/components",
"utils": "@/shared/utils",
"ui": "@/shared/components/ui"
}
}
\`\`\`

### 3. Create Utility Function

\`\`\`typescript
// src/shared/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
return twMerge(clsx(inputs));
}
\`\`\`

### 4. Add Base Components

\`\`\`bash
npx shadcn@latest add button input card label
\`\`\`

### 5. Create Layout Components

Build reusable Header and Footer components.

### 6. Add Theme Support

Install next-themes:

\`\`\`bash
pnpm add next-themes
\`\`\`

Create ThemeProvider and ThemeToggle components.

### 7. Update Root Layout

Wrap app with ThemeProvider and add Header/Footer.

## Verification

\`\`\`bash

# Check components render

pnpm run dev

# Try dark mode toggle

# Verify color scheme changes

\`\`\`

## Summary

Phase 2 establishes the styling system:

- ✅ Tailwind CSS 4 configured
- ✅ CSS variable theming
- ✅ Shadcn UI initialized
- ✅ Base components added
- ✅ Layout components created
- ✅ Dark mode support

## Next Up

[Phase 3: Core Infrastructure](03-core-infrastructure.md) - Setting up T3 Env and LogTape.
