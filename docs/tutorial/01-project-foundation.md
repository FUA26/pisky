# Phase 1: Project Foundation

> Setting up a modern Next.js 16 project with TypeScript, ESLint, Prettier, and conventional commits.

## Overview

This phase covers initializing a Next.js 16 project with development tools configured for AI-friendly, pragmatic development.

## What You'll Learn

- Creating a Next.js 16 project with create-next-app
- Configuring TypeScript with strict but pragmatic settings
- Setting up ESLint with relaxed, AI-friendly rules
- Configuring Prettier for consistent formatting
- Setting up Lefthook for git hooks
- Configuring Commitlint and Commitizen for conventional commits
- Creating a feature-based folder structure

## Prerequisites

- Node.js 22+
- pnpm

## Steps

### 1. Initialize Next.js Project

\`\`\`bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/\*"
\`\`\`

### 2. Configure TypeScript

Enable strict mode with AI-friendly settings:

\`\`\`json
{
"compilerOptions": {
"strict": true,
"noUnusedLocals": false,
"noUnusedParameters": false,
"paths": {
"@/_": ["./src/_"],
"@/features/_": ["./src/features/_"],
"@/shared/_": ["./src/shared/_"],
"@/config/_": ["./src/config/_"]
}
}
}
\`\`\`

### 3. Configure ESLint

Use ESLint with relaxed rules for AI development:

\`\`\`javascript
{
"rules": {
"@typescript-eslint/no-unused-vars": "off",
"no-console": "off"
}
}
\`\`\`

### 4. Configure Prettier

\`\`\`json
{
"semi": true,
"singleQuote": false,
"trailingComma": "es5"
}
\`\`\`

### 5. Setup Git Hooks

Configure Lefthook for pre-commit and pre-push hooks:

\`\`\`yaml
pre-commit:
commands:
prettier:
run: npx prettier --write {staged_files}

pre-push:
commands:
type-check:
run: npx tsc --noEmit
lint:
run: pnpm run lint
\`\`\`

### 6. Setup Conventional Commits

Configure Commitlint and Commitizen for consistent commit messages.

### 7. Create Feature-Based Structure

\`\`\`
pisky/
├── features/ # Feature modules
├── shared/ # Shared code
└── config/ # Configuration
\`\`\`

## Verification

\`\`\`bash

# Run dev server

pnpm run dev

# Check types

npx tsc --noEmit

# Run linter

pnpm run lint

# Format code

pnpm run format
\`\`\`

## Summary

Phase 1 establishes the foundation with:

- ✅ Next.js 16 project
- ✅ TypeScript configuration
- ✅ ESLint + Prettier
- ✅ Git hooks with Lefthook
- ✅ Conventional commits
- ✅ Feature-based structure

## Next Up

[Phase 2: Styling System](02-styling-system.md) - Setting up Tailwind CSS 4 and Shadcn UI.
