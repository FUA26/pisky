# Pisky Boilerplate - Design Specification

**Date:** 2026-03-28
**Author:** [To be determined]
**Status:** Approved
**Type:** New Project - Boilerplate Creation

---

## 1. Overview

### 1.1 Purpose

Create a personalized Next.js 16+ boilerplate called **pisky**, inspired by Next-js-Boilerplate but adapted to personal preferences. The boilerplate will serve as a foundation for future projects and include comprehensive tutorial documentation.

### 1.2 Goals

1. **Personalized Boilerplate** - Tailored to specific development preferences
2. **Tutorial Documentation** - Step-by-step guides for each implementation phase
3. **Production-Ready** - Complete with monitoring, testing, and deployment setup
4. **Feature-Based Architecture** - Modern, scalable project structure
5. **AI-Friendly** - Tooling optimized for AI-assisted development

### 1.3 Inspiration

Analyzed from: `/home/acn/acn/Next-js-Boilerplate`
- Used as reference only, not direct copy
- Key concepts retained, implementation adapted

---

## 2. Tech Stack

### 2.1 Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.2.1+ | Framework with App Router |
| React | 19.2.4+ | UI Library |
| TypeScript | 5.9.3+ | Type Safety |
| Node.js | 22+ | Runtime Environment |

### 2.2 Styling

| Technology | Purpose |
|------------|---------|
| Tailwind CSS | 4.x Utility-first CSS |
| Shadcn UI | Component library (copy-paste) |
| CSS Variables | Flexible theming system |

### 2.3 Database & ORM

| Technology | Purpose |
|------------|---------|
| DrizzleORM | Type-safe ORM |
| PGlite | Local development database |
| PostgreSQL | Production database (provider-agnostic) |

### 2.4 Authentication

| Technology | Purpose |
|------------|---------|
| NextAuth.js v5 | Authentication framework |
| Credentials | Username/password auth |
| OAuth | Social auth (GitHub, Google) |

### 2.5 Validation & Forms

| Technology | Purpose |
|------------|---------|
| Zod | Schema validation |
| React Hook Form | Form management |

### 2.6 Code Quality

| Technology | Purpose |
|------------|---------|
| ESLint | Linting (relaxed rules) |
| Prettier | Code formatting |
| Lefthook | Git hooks |
| Commitlint | Commit convention |
| Commitizen | Commit CLI |
| Knip | Unused dependency detection |

### 2.7 Testing

| Technology | Purpose |
|------------|---------|
| Vitest | Unit testing (basic setup) |
| Playwright | E2E testing (basic setup) |

### 2.8 Monitoring & Logging

| Technology | Purpose |
|------------|---------|
| Sentry | Error monitoring |
| LogTape | Structured logging |
| Better Stack | Log management |

### 2.9 Internationalization

| Technology | Purpose |
|------------|---------|
| next-intl | i18n support |

### 2.10 CI/CD & Deployment

| Technology | Purpose |
|------------|---------|
| GitHub Actions | CI/CD workflows |
| Docker | Containerization |
| Semantic Release | Changelog generation |

---

## 3. Architecture

### 3.1 Project Structure

```
pisky/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Dashboard route group
│   │   └── layout.tsx
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   └── health/
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── features/                     # Feature modules
│   ├── auth/
│   │   ├── components/           # SignInForm, SignUpForm, AuthHeader
│   │   ├── hooks/                # useAuth, useSession
│   │   ├── services/             # authService, sessionService
│   │   ├── types/                # AuthUser, Session
│   │   └── utils/                # authHelpers
│   ├── database/
│   │   ├── migrations/           # Migration files
│   │   ├── models/               # Drizzle schema
│   │   ├── seed/                 # Seed scripts
│   │   └── utils/                # db connection, queries
│   └── monitoring/
│       ├── sentry/
│       └── logtape/
├── shared/                       # Shared/reusable code
│   ├── components/
│   │   ├── ui/                   # Shadcn components
│   │   └── layout/               # Header, Footer, Sidebar
│   ├── hooks/                    # useLocalStorage, useMediaQuery
│   ├── utils/                    # cn, formatDate, etc.
│   └── types/                    # Shared types
├── config/                       # Configuration
│   ├── env.ts                    # Env validation
│   ├── auth.ts                   # NextAuth config
│   ├── db.ts                     # Drizzle config
│   └── logging.ts                # LogTape config
├── public/                       # Static assets
├── tests/                        # Tests
│   ├── unit/                     # Vitest tests
│   └── e2e/                      # Playwright tests
├── docs/                         # Documentation
│   ├── tutorial/                 # Tutorial series
│   ├── guide/                    # User guides
│   └── PROGRESS.md               # Progress tracker
├── .github/
│   └── workflows/                # CI/CD
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
└── [config files]                # ESLint, Prettier, TS, etc.
```

### 3.2 Feature-Based Architecture Principles

1. **Co-location** - Related code stays together
2. **Isolation** - Each feature is independent
3. **Shared separation** - Reusable code in shared/
4. **Config centralization** - All config in config/

### 3.3 Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Client    │────▶│  API Route   │────▶│  Database    │
│  Components  │     │  Handlers    │     │  (Drizzle)   │
└──────────────┘     └──────────────┘     └──────────────┘
       │                     │                     │
       │◀─────────────────────┴─────────────────────┤
       │        JSON Response (validated)            │
       ▼                                             ▼
┌──────────────┐                             ┌──────────────┐
│   Update UI  │                             │   Log to     │
│              │                             │   Sentry     │
└──────────────┘                             └──────────────┘
```

### 3.4 Error Handling

Unified error handling strategy:
- Client errors: React Error Boundaries
- Server errors: Standardized API responses
- External errors: Try-catch with logging to Sentry
- User feedback: Friendly error messages

---

## 4. Implementation Phases

### Phase 1: Project Foundation
**Branch:** `feat/project-foundation`
**Tutorial:** `docs/tutorial/01-project-foundation.md`

Initialize Next.js project with TypeScript, configure ESLint (relaxed), Prettier, Lefthook, Commitlint, and create feature-based folder structure.

### Phase 2: Styling System
**Branch:** `feat/styling-system`
**Tutorial:** `docs/tutorial/02-styling-system.md`

Setup Tailwind CSS 4 with CSS variables for flexible theming, initialize Shadcn UI, and install base components.

### Phase 3: Core Infrastructure
**Branch:** `feat/core-infrastructure`
**Tutorial:** `docs/tutorial/03-core-infrastructure.md`

Configure T3 Env for type-safe environment variables, setup LogTape logging, and create utility functions.

### Phase 4: Database Layer
**Branch:** `feat/database-layer`
**Tutorial:** `docs/tutorial/04-database-layer.md`

Install DrizzleORM, setup PGlite for local development, configure Drizzle Kit, and create base schema with migrations.

### Phase 5: Authentication
**Branch:** `feat/authentication-nextauth`
**Tutorial:** `docs/tutorial/05-authentication.md`

Setup NextAuth.js v5 with credentials and OAuth providers, create auth feature module with UI pages.

### Phase 6: API Layer
**Branch:** `feat/api-layer`
**Tutorial:** `docs/tutorial/06-api-layer.md`

Create API route handler pattern, setup Zod validation middleware, implement unified error handling.

### Phase 7: Testing Setup
**Branch:** `feat/testing-setup`
**Tutorial:** `docs/tutorial/07-testing-setup.md`

Configure Vitest for unit testing and Playwright for E2E testing with basic setup (pragmatic approach).

### Phase 8: Error Monitoring
**Branch:** `feat/error-monitoring`
**Tutorial:** `docs/tutorial/08-error-monitoring.md`

Integrate Sentry for error monitoring with Spotlight for development, setup error boundaries.

### Phase 9: CI/CD & Deployment
**Branch:** `feat/cicd-deployment`
**Tutorial:** `docs/tutorial/09-cicd-deployment.md`

Create Dockerfile with multi-stage build, setup docker-compose, configure GitHub Actions workflows and Semantic Release.

### Phase 10: Final Polish
**Branch:** `feat/final-polish`
**Tutorial:** `docs/tutorial/10-final-polish.md`

Complete README, create architecture docs, add customization guide, and final verification.

---

## 5. Configuration Standards

### 5.1 ESLint (Relaxed, AI-Friendly)

- Next.js recommended rules
- TypeScript rules enabled
- No unused vars warnings (AI generates temp vars)
- Console.log allowed in development
- Styling handled by Prettier

### 5.2 Prettier

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### 5.3 TypeScript

- Strict mode enabled
- `noUnusedLocals: false` (AI-friendly)
- `noUnusedParameters: false` (AI-friendly)
- Path aliases configured

### 5.4 Tailwind CSS Variables

Flexible theming with CSS variables:
- `--primary`
- `--secondary`
- `--accent`
- `--background`
- `--foreground`

---

## 6. Git Workflow

### 6.1 Branching Strategy

```
main (protected)
  ↑
  develop (integration)
  ↑
  ├── feat/*    (new features)
  ├── fix/*     (bug fixes)
  ├── chore/*   (maintenance)
  ├── docs/*    (documentation)
  └── refactor/* (refactoring)
```

### 6.2 Commit Convention

Following Conventional Commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `chore:` - Maintenance
- `refactor:` - Code restructuring
- `test:` - Adding tests

### 6.3 Per-Task Workflow

1. Create branch from `develop`
2. Implement changes
3. Test locally
4. Commit with conventional message
5. Create PR to `develop`
6. Review and merge
7. Branch auto-delete

---

## 7. Docker Deployment

### 7.1 Multi-Stage Build

1. **Dependencies:** Install packages
2. **Build:** Compile Next.js
3. **Production:** Slim final image

### 7.2 Configuration

- Base: `node:22-alpine`
- Non-root user for security
- Health check endpoint
- Environment variable support

### 7.3 Deployment Support

- Docker Compose (VPS)
- Docker Swarm
- Kubernetes (Helm optional)
- Any cloud with Docker support

---

## 8. Documentation Strategy

### 8.1 Tutorial Series

Each phase produces one tutorial post:
- Written in English
- Step-by-step format
- Includes verification steps
- Links to next phase

### 8.2 In-Repo Documentation

```
docs/
├── tutorial/          # Tutorial series (10 posts)
├── guide/             # User guides
├── PROGRESS.md        # Progress tracker
└── API.md             # API documentation (optional)
```

### 8.3 README Structure

1. Project overview
2. Features list
3. Quick start
4. Tutorial series links
5. Customization guide
6. Deployment guide

---

## 9. Progress Tracking

Progress tracked in `docs/PROGRESS.md` with:
- Phase checklist
- Task breakdown per phase
- Milestone tracking
- Status indicators

---

## 10. Success Criteria

### 10.1 Functional Requirements

- [ ] All 10 phases completed
- [ ] All features working as specified
- [ ] Docker deployment successful
- [ ] Tests passing (basic setup)

### 10.2 Documentation Requirements

- [ ] 10 tutorial posts completed
- [ ] README comprehensive
- [ ] Architecture docs clear
- [ ] Customization guide included

### 10.3 Quality Requirements

- [ ] Type-safe codebase
- [ ] ESLint passes
- [ ] No console errors
- [ ] Sentry integration functional

---

## 11. Out of Scope (Future Enhancements)

The following are NOT included in initial implementation but noted for future reference:

- Email service integration
- File upload system
- Search functionality
- Webhooks
- WebSocket/real-time features
- Background jobs/queues
- CMS integration
- Payment processing
- Multi-tenancy
- Role-based access control

---

## Appendix A: Key Differences from Next-js-Boilerplate

| Aspect | Next-js-Boilerplate | Pisky |
|--------|---------------------|-------|
| Linter | Oxlint | ESLint |
| Formatter | Oxfmt | Prettier |
| Auth | Clerk | NextAuth.js |
| Structure | Standard | Feature-based |
| UI | Minimalist | Shadcn UI |
| Testing | Comprehensive | Pragmatic (minimum) |
| CI/CD Review | CodeRabbit | None |
| Production DB | Neon | Provider-agnostic |

---

## Appendix B: NJB Reference Workflow

### B.1 Purpose

Ensure proper utilization of Next-js-Boilerplate (NJB) knowledge while implementing pisky according to our specifications. This workflow prevents both unnecessary reinvention and blind copying.

### B.2 Reference-First Implementation Workflow

For each phase/task:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. UNDERSTAND PHASE REQUIREMENTS                            │
│    - Read spec for current phase                            │
│    - List what needs to be implemented                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CHECK NJB FOR RELEVANT IMPLEMENTATION                    │
│    - Search NJB for similar functionality                   │
│    - Identify dependencies used                             │
│    - Note patterns and approaches                           │
│    - Extract what's useful, ignore what's not               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. ADAPT TO PISKY REQUIREMENTS                               │
│    - Adjust NJB patterns to our tech stack differences      │
│    - Restructure to feature-based architecture             │
│    - Apply our configuration standards                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. IMPLEMENT IN PISKY                                       │
│    - Write code according to our standards                  │
│    - Document differences from NJB                          │
│    - Note why certain decisions were made                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. VERIFY & DOCUMENT                                        │
│    - Test implementation                                    │
│    - Document in tutorial format                            │
│    - Update PROGRESS.md                                     │
└─────────────────────────────────────────────────────────────┘
```

### B.3 Key Differences to Remember

When referencing NJB, ALWAYS account for these differences:

| Aspect | NJB | Pisky | Impact |
|--------|-----|-------|--------|
| Linter | Oxlint | ESLint | Different config files, rules |
| Formatter | Oxfmt | Prettier | Different formatting approach |
| Auth | Clerk | NextAuth | Completely different implementation |
| Structure | Standard | Feature-based | Code must be reorganized |
| UI | Minimalist | Shadcn | Component source differs |
| DB Provider | Neon-specific | Agnostic | No hardcoded provider refs |

### B.4 What to Extract from NJB

✅ **Extract and Adapt:**
- Configuration patterns (adjust for our tools)
- Testing approaches (simplified for our needs)
- Error handling patterns
- TypeScript patterns
- Folder naming conventions (where applicable)
- Integration setups (Sentry, LogTape, etc.)

❌ **Do NOT Copy:**
- Clerk-specific code (we use NextAuth)
- Neon-specific code (we're agnostic)
- Oxlint/Oxfmt configs (we use ESLint/Prettier)
- Structure that doesn't match feature-based
- CodeRabbit-specific configurations
- Anything marked FIXME in NJB (those are for user customization)

### B.5 Reference Commands

Useful commands for checking NJB:

```bash
# Find relevant files in NJB for a feature
grep -r "feature-name" /home/acn/acn/Next-js-Boilerplate/src/

# Check how NJB configures a tool
cat /home/acn/acn/Next-js-Boilerplate/[tool-config-file]

# See what dependencies NJB uses for a feature
grep -A 10 "feature-name" /home/acn/acn/Next-js-Boilerplate/package.json
```

---

## Appendix C: References

- Source Inspiration: `/home/acn/acn/Next-js-Boilerplate`
- Progress Tracker: `docs/PROGRESS.md`
- Tutorial Directory: `docs/tutorial/`
- NJB Reference Workflow: Appendix B

---

*Document Version: 1.1*
*Last Updated: 2026-03-28*
