# Pisky Boilerplate - Progress Tracker

> Creating a personalized Next.js 16+ boilerplate inspired by Next-js-Boilerplate

**Started:** 2026-03-28
**Goal:** Production-ready boilerplate with comprehensive tutorial documentation

---

## Overview

This document tracks the progress of building **pisky** - a personalized Next.js boilerplate with feature-based architecture, modern tooling, and detailed tutorial documentation.

---

## Implementation Workflow

**IMPORTANT:** Before implementing any phase, follow the NJB Reference Workflow:

```
1. UNDERSTAND → Read spec for current phase requirements
2. CHECK NJB  → Search Next-js-Boilerplate for relevant implementation
3. ADAPT      → Adjust patterns to pisky's tech stack and structure
4. IMPLEMENT  → Write code according to our standards
5. VERIFY     → Test and document
```

**Skill Available:** Use `/njb-reference` skill for guided workflow.

**Key Differences to Remember:**

- NJB uses Oxlint/Oxfmt → Pisky uses ESLint/Prettier
- NJB uses Clerk → Pisky uses NextAuth.js
- NJB uses Neon → Pisky is provider-agnostic
- NJB structure → Pisky uses feature-based

---

## Tech Stack

| Category     | Technology                                    | Status |
| ------------ | --------------------------------------------- | ------ |
| Core         | Next.js 16+, React 19, TypeScript, Node 22    | -      |
| Styling      | Tailwind CSS 4, Shadcn UI, CSS Variables      | -      |
| Database     | DrizzleORM, PGlite (local), PostgreSQL (prod) | -      |
| Auth         | NextAuth.js (Credentials + OAuth)             | -      |
| Validation   | Zod, React Hook Form                          | -      |
| Code Quality | ESLint, Prettier, Lefthook, Commitlint        | -      |
| Testing      | Vitest, Playwright (basic setup)              | -      |
| Monitoring   | Sentry, LogTape, Better Stack                 | -      |
| CI/CD        | GitHub Actions, Docker, Semantic Release      | -      |

---

## Phase Progress

### Phase 1: Project Foundation

**Branch:** `feat/project-foundation`
**Tutorial:** `docs/tutorial/01-project-foundation.md`
**Status:** [ ] Not Started

| Task                                  | Status | Notes                              |
| ------------------------------------- | ------ | ---------------------------------- |
| Initialize Next.js 16 project         | [ ]    | Using `npx create-next-app@latest` |
| Setup ESLint (relaxed, AI-friendly)   | [ ]    | Replace Oxlint                     |
| Setup Prettier                        | [ ]    | Replace Oxfmt                      |
| Configure TypeScript                  | [ ]    | Strict but pragmatic settings      |
| Create feature-based folder structure | [ ]    | app/, features/, shared/, config/  |
| Setup absolute imports (@/ aliases)   | [ ]    | tsconfig paths                     |
| Configure Lefthook                    | [ ]    | Git hooks                          |
| Setup Commitlint + Commitizen         | [ ]    | Conventional commits               |
| Create initial README                 | [ ]    | Basic project info                 |
| Write tutorial documentation          | [ ]    | Step-by-step guide                 |

---

### Phase 2: Styling System

**Branch:** `feat/styling-system`
**Tutorial:** `docs/tutorial/02-styling-system.md`
**Status:** [ ] Not Started

| Task                                   | Status | Notes                            |
| -------------------------------------- | ------ | -------------------------------- |
| Install Tailwind CSS 4                 | [ ]    | Latest version                   |
| Setup CSS variables (flexible theming) | [ ]    | Primary, secondary, accent, etc. |
| Initialize Shadcn UI                   | [ ]    | Using shadcn CLI                 |
| Install base UI components             | [ ]    | Button, Input, Card, etc.        |
| Create theme system                    | [ ]    | CSS variable based               |
| Setup global styles                    | [ ]    | Tailwind base + custom           |
| Create shared layout components        | [ ]    | Header, Footer patterns          |
| Write tutorial documentation           | [ ]    | Include theming guide            |

---

### Phase 3: Core Infrastructure

**Branch:** `feat/core-infrastructure`
**Tutorial:** `docs/tutorial/03-core-infrastructure.md`
**Status:** [ ] Not Started

| Task                            | Status | Notes                                  |
| ------------------------------- | ------ | -------------------------------------- |
| Setup T3 Env for env validation | [ ]    | Type-safe environment variables        |
| Configure LogTape logging       | [ ]    | Structured logging                     |
| Setup absolute imports fully    | [ ]    | All paths working                      |
| Create config module            | [ ]    | Centralized configuration              |
| Add utility functions           | [ ]    | cn, formatDate, etc.                   |
| Setup Better Stack integration  | [ ]    | Log management (optional for tutorial) |
| Write tutorial documentation    | [ ]    | Env setup and logging                  |

---

### Phase 4: Database Layer

**Branch:** `feat/database-layer`
**Tutorial:** `docs/tutorial/04-database-layer.md`
**Status:** [ ] Not Started

| Task                               | Status | Notes                       |
| ---------------------------------- | ------ | --------------------------- |
| Install DrizzleORM                 | [ ]    | Core package                |
| Setup PGlite for local development | [ ]    | Zero-config local DB        |
| Configure Drizzle Kit              | [ ]    | Migration tool              |
| Create base schema                 | [ ]    | User model to start         |
| Setup migration system             | [ ]    | Generate and run migrations |
| Create database utilities          | [ ]    | Connection, query helpers   |
| Add seed scripts                   | [ ]    | Development data            |
| Write tutorial documentation       | [ ]    | ORM and migrations          |

---

### Phase 5: Authentication

**Branch:** `feat/authentication-nextauth`
**Tutorial:** `docs/tutorial/05-authentication.md`
**Status:** [ ] Not Started

| Task                           | Status | Notes                       |
| ------------------------------ | ------ | --------------------------- |
| Install NextAuth.js v5         | [ ]    | Auth.js core                |
| Setup auth configuration       | [ ]    | Providers, callbacks        |
| Implement credentials provider | [ ]    | Username/password           |
| Setup OAuth providers          | [ ]    | GitHub, Google (optional)   |
| Create auth feature module     | [ ]    | Components, hooks, services |
| Build auth UI pages            | [ ]    | Sign in, Sign up            |
| Setup session management       | [ ]    | JWT strategy                |
| Add protected route middleware | [ ]    | Route protection            |
| Write tutorial documentation   | [ ]    | NextAuth setup guide        |

---

### Phase 6: API Layer

**Branch:** `feat/api-layer`
**Tutorial:** `docs/tutorial/06-api-layer.md`
**Status:** [ ] Not Started

| Task                             | Status | Notes                    |
| -------------------------------- | ------ | ------------------------ |
| Create API route handler pattern | [ ]    | Standard response format |
| Setup Zod validation middleware  | [ ]    | Request validation       |
| Implement error handling         | [ ]    | Unified error responses  |
| Create example API endpoints     | [ ]    | CRUD operations          |
| Add API documentation pattern    | [ ]    | Comments/JSDoc           |
| Write tutorial documentation     | [ ]    | Building type-safe APIs  |

---

### Phase 7: Testing Setup

**Branch:** `feat/testing-setup`
**Tutorial:** `docs/tutorial/07-testing-setup.md`
**Status:** [ ] Not Started

| Task                         | Status | Notes                      |
| ---------------------------- | ------ | -------------------------- |
| Setup Vitest                 | [ ]    | Unit testing framework     |
| Configure Playwright         | [ ]    | E2E testing                |
| Create example unit tests    | [ ]    | Utility function tests     |
| Create example E2E tests     | [ ]    | Critical user flows        |
| Setup test scripts           | [ ]    | package.json commands      |
| Write tutorial documentation | [ ]    | Pragmatic testing approach |

---

### Phase 8: Error Monitoring

**Branch:** `feat/error-monitoring`
**Tutorial:** `docs/tutorial/08-error-monitoring.md`
**Status:** [ ] Not Started

| Task                                | Status | Notes                 |
| ----------------------------------- | ------ | --------------------- |
| Install Sentry SDK                  | [ ]    | Next.js integration   |
| Setup Sentry for development        | [ ]    | Spotlight integration |
| Configure production error tracking | [ ]    | DSN setup             |
| Add error boundaries                | [ ]    | React error handling  |
| Create monitoring utilities         | [ ]    | Custom error tracking |
| Write tutorial documentation        | [ ]    | Sentry setup guide    |

---

### Phase 9: CI/CD & Deployment

**Branch:** `feat/cicd-deployment`
**Tutorial:** `docs/tutorial/09-cicd-deployment.md`
**Status:** [ ] Not Started

| Task                            | Status | Notes                |
| ------------------------------- | ------ | -------------------- |
| Create Dockerfile               | [ ]    | Multi-stage build    |
| Setup docker-compose            | [ ]    | Local development    |
| Create GitHub Actions workflows | [ ]    | CI, lint, test       |
| Setup Semantic Release          | [ ]    | Changelog generation |
| Configure deployment workflow   | [ ]    | Docker deploy        |
| Add health check endpoint       | [ ]    | /api/health          |
| Write tutorial documentation    | [ ]    | Deployment guide     |

---

### Phase 10: Final Polish

**Branch:** `feat/final-polish`
**Tutorial:** `docs/tutorial/10-final-polish.md`
**Status:** [ ] Not Started

| Task                         | Status | Notes                  |
| ---------------------------- | ------ | ---------------------- |
| Complete README              | [ ]    | Full documentation     |
| Create architecture docs     | [ ]    | System overview        |
| Add customization guide      | [ ]    | How to modify          |
| Create troubleshooting guide | [ ]    | Common issues          |
| Final testing verification   | [ ]    | All features working   |
| Setup GitHub repo template   | [ ]    | Use as template        |
| Write tutorial documentation | [ ]    | Wrap-up and next steps |

---

## Milestones

| Milestone                         | Target                | Status | Date |
| --------------------------------- | --------------------- | ------ | ---- |
| Phase 1-3: Foundation Complete    | Base project ready    | [ ]    | -    |
| Phase 4-5: Data & Auth Complete   | Core features working | [ ]    | -    |
| Phase 6-7: API & Testing Complete | Feature complete      | [ ]    | -    |
| Phase 8-10: Production Ready      | Boilerplate ready     | [ ]    | -    |

---

## Notes

### Future Enhancements (For Reference)

- Email service (Resend, SendGrid)
- File upload (S3, R2)
- Search functionality
- Webhooks
- WebSocket/real-time
- Background jobs/queues
- CMS integration
- Payment/Stripe
- Multi-tenancy
- RBAC

### Dependencies Reference

- Analyzed from: `/home/acn/acn/Next-js-Boilerplate`
- Inspiration only, not direct copy

---

_Last Updated: 2026-03-28_
