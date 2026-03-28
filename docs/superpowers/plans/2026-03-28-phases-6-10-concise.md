# Phases 6-10: Implementation Plans (Concise)

> **For agentic workers:** Each phase follows the same pattern. Use superpowers:subagent-driven-development for execution.

---

## Phase 6: API Layer

**Goal:** Create API route handler pattern, Zod validation, unified error handling.

**NJB Reference:** `/home/acn/acn/Next-js-Boilerplate/src/app/api/`

### Tasks

1. **Create API response types**
   - `src/shared/types/api.ts` - ApiResponse, ApiError

2. **Build error handler**
   - `src/shared/api/error-handler.ts`
   - Standardized error responses

3. **Setup Zod validation**
   - `src/shared/api/validation.ts`
   - Middleware for request validation

4. **Create example endpoints**
   - `src/app/api/health/route.ts`
   - `src/app/api/users/route.ts`
   - GET, POST patterns

5. **Build API utilities**
   - `src/shared/api/response.ts` - success/error helpers

**Verification:**

```bash
curl http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"email":"test@example.com"}'
```

---

## Phase 7: Testing Setup

**Goal:** Configure Vitest and Playwright (basic setup).

**NJB Reference:** `/home/acn/acn/Next-js-Boilerplate/vitest.config.mts`, `/home/acn/acn/Next-js-Boilerplate/playwright.config.ts`

### Tasks

1. **Install Vitest**

   ```bash
   npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react
   ```

2. **Configure Vitest**
   - `vitest.config.ts` - React, testing-library setup
   - Add test scripts to package.json

3. **Create example unit tests**
   - `src/shared/utils/__tests__/cn.test.ts`
   - `src/shared/utils/__tests__/date.test.ts`

4. **Install Playwright**

   ```bash
   npm install --save-dev @playwright/test
   npx playwright install
   ```

5. **Configure Playwright**
   - `playwright.config.ts`
   - Add E2E test scripts

6. **Create example E2E tests**
   - `tests/e2e/home.spec.ts` - basic page load test

**Verification:**

```bash
npm run test
npm run test:e2e
```

---

## Phase 8: Error Monitoring

**Goal:** Integrate Sentry with Spotlight for development.

**NJB Reference:** `/home/acn/acn/Next-js-Boilerplate/src/libs/Sentry.ts`

### Tasks

1. **Install Sentry**

   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

2. **Configure Sentry**
   - `sentry.server.config.ts`
   - `sentry.client.config.ts`
   - `sentry.edge.config.ts`

3. **Setup Spotlight**
   - Add for development error viewing

4. **Create error boundaries**
   - `src/shared/components/error-boundary.tsx`

5. **Test error tracking**
   - Throw test error to verify Sentry capture

**Verification:**

```bash
# Check Sentry dashboard
# Visit http://localhost:8969 for Spotlight (dev)
```

---

## Phase 9: CI/CD & Deployment

**Goal:** Docker setup, GitHub Actions, Semantic Release.

**NJB Reference:** `/home/acn/acn/Next-js-Boilerplate/.github/workflows/`

### Tasks

1. **Create Dockerfile**

   ```dockerfile
   # Multi-stage build
   FROM node:22-alpine AS deps
   FROM node:22-alpine AS builder
   FROM node:22-alpine AS runner
   ```

2. **Create docker-compose.yml**
   - Local development setup
   - Database service

3. **Create GitHub Actions workflows**
   - `.github/workflows/ci.yml` - lint, test, build
   - `.github/workflows/docker.yml` - build and push image

4. **Setup Semantic Release**

   ```bash
   npm install --save-dev semantic-release @semantic-release/git @semantic-release/changelog
   ```

   - `.releaserc.json` configuration

5. **Add health check endpoint**
   - `src/app/api/health/route.ts`

6. **Create deployment documentation**
   - `docs/guide/deployment.md`

**Verification:**

```bash
docker build -t pisky .
docker run -p 3000:3000 pisky
```

---

## Phase 10: Final Polish

**Goal:** Complete documentation, verification, template setup.

### Tasks

1. **Complete README**
   - All sections filled
   - Badges added
   - Screenshots (optional)

2. **Create architecture docs**
   - `docs/guide/architecture.md` - detailed
   - Feature descriptions
   - Data flow diagrams

3. **Write customization guide**
   - `docs/guide/customization.md`
   - How to modify colors
   - How to add features
   - How to swap components

4. **Create troubleshooting guide**
   - `docs/guide/troubleshooting.md`
   - Common issues
   - Solutions

5. **Final testing verification**
   - All phases working
   - Build successful
   - Docker image working

6. **Setup GitHub template**
   - Add template metadata
   - Create .github/content files

**Verification:**

```bash
npm run build
npm run test
docker build -t pisky .
```

---

## Execution Order

```
Phase 6: API Layer
    ↓
Phase 7: Testing Setup
    ↓
Phase 8: Error Monitoring
    ↓
Phase 9: CI/CD & Deployment
    ↓
Phase 10: Final Polish
```

---

## Notes

- Each phase should follow the commit convention
- Update PROGRESS.md after each phase
- Create tutorial for each phase
- Tag releases after each phase

---

**Template for detailed phase plan:**

Each phase should be expanded into a detailed plan following the format used in Phases 1-5:

- Goal statement
- Architecture notes
- NJB reference points
- Detailed tasks with:
  - Files to create/modify
  - Step-by-step instructions
  - Code blocks
  - Verification commands
  - Commit messages

**Generate detailed plans on-demand as needed for implementation.**
