# Pisky Architecture

## Project Structure

\`\`\`
pisky/
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── (auth)/ # Auth route group
│ │ ├── (dashboard)/ # Dashboard route group
│ │ ├── api/ # API routes
│ │ ├── layout.tsx # Root layout
│ │ └── page.tsx # Home page
│ ├── features/ # Feature modules
│ │ ├── auth/ # Authentication feature
│ │ │ ├── components/ # Auth-specific UI
│ │ │ ├── hooks/ # Auth hooks
│ │ │ ├── services/ # Auth API calls
│ │ │ ├── types/ # Auth types
│ │ │ └── utils/ # Auth utilities
│ │ ├── database/ # Database feature
│ │ └── monitoring/ # Monitoring feature
│ ├── shared/ # Shared/reusable code
│ │ ├── components/
│ │ │ ├── ui/ # Shadcn components
│ │ │ └── layout/ # Header, Footer
│ │ ├── hooks/ # Shared hooks
│ │ ├── utils/ # Utilities
│ │ └── types/ # Shared types
│ └── config/ # Configuration
│ ├── env.ts # Environment variables
│ ├── auth.ts # NextAuth config
│ ├── db.ts # Drizzle config
│ └── logging.ts # LogTape config
├── tests/ # Tests
│ ├── unit/ # Vitest tests
│ └── e2e/ # Playwright tests
├── docs/ # Documentation
└── docker/ # Docker setup
\`\`\`

## Feature-Based Architecture

Each feature is self-contained with:

- \`components/\` - Feature-specific UI components
- \`hooks/\` - Feature-specific hooks
- \`services/\` - Feature-specific API/services
- \`types/\` - Feature-specific types
- \`utils/\` - Feature-specific utilities

Shared code lives in \`shared/\` for reusability.

## Design Principles

1. **Co-location** - Related code stays together
2. **Isolation** - Each feature is independent
3. **Shared separation** - Reusable code in shared/
4. **Config centralization** - All config in config/
