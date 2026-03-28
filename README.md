# Pisky Boilerplate

> A personalized Next.js 16+ boilerplate with feature-based architecture, modern tooling, and AI-friendly development experience.

## Status

✅ Phase 1: Project Foundation - Complete
✅ Phase 2: Styling System - Complete
✅ Phase 3: Core Infrastructure - Complete

## Features

- **Next.js 16** with App Router
- **React 19** with Server Components
- **TypeScript** with strict but pragmatic configuration
- **Tailwind CSS 4** for styling
- **Shadcn UI** components
- **Dark mode** support
- **T3 Env** for type-safe environment variables
- **Utility functions** for common operations
- **ESLint + Prettier** for code quality (AI-friendly)
- **Lefthook** for git hooks
- **Commitlint + Commitizen** for conventional commits
- **Feature-based architecture** for scalable code organization

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development server
pnpm run dev

# Run linting
pnpm run lint

# Format code
pnpm run format

# Commit changes
pnpm run commit
```

## Project Structure

```
pisky/
├── src/
│   ├── app/              # Next.js App Router
│   ├── features/         # Feature modules
│   ├── shared/           # Shared/reusable code
│   └── config/           # Configuration
├── tests/                # Tests
└── docs/                 # Documentation
```

## Documentation

- [Progress Tracker](docs/PROGRESS.md)
- [Architecture Guide](docs/guide/architecture.md)
- [Tutorial Series](docs/tutorial/)

## Tech Stack

| Category   | Technology                        | Status |
| ---------- | --------------------------------- | ------ |
| Core       | Next.js 16+, React 19, TypeScript | ✅     |
| Styling    | Tailwind CSS 4, Shadcn UI         | ✅     |
| Env Vars   | T3 Env                            | ✅     |
| Utilities  | Custom utils                      | ✅     |
| Validation | Zod                               | ✅     |
| Database   | DrizzleORM (planned)              | ⏳     |
| Auth       | NextAuth.js (planned)             | ⏳     |

## License

MIT
