# Phase 5: Authentication

> Implementing flexible authentication with NextAuth.js v5.

## Overview

This phase adds authentication with credentials and OAuth providers.

## What You'll Learn

- Configuring NextAuth.js v5
- Setting up credentials provider
- Adding OAuth providers (GitHub, Google)
- Creating auth UI components
- Protecting routes with middleware

## Prerequisites

- Phase 1-4 complete

## Steps

### 1. Install NextAuth.js

```bash
pnpm add next-auth@beta bcrypt
pnpm add -D @types/bcrypt
```

### 2. Configure Auth

Create `config/auth.ts`:

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // ... configuration
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
});
```

### 3. Create API Route

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/config/auth";

export const { GET, POST } = handlers;
```

### 4. Add SessionProvider

Wrap your app with SessionProvider in `app/layout.tsx`:

```typescript
import { SessionProvider } from "@/components/session-provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

### 5. Create Sign-in Page

Create `app/(auth)/sign-in/page.tsx` with sign-in form and OAuth buttons.

### 6. Add Middleware

Create `middleware.ts` for route protection:

```typescript
import { auth } from "@/config/auth";

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
});
```

### 7. Generate AUTH_SECRET

```bash
openssl rand -base64 32
```

Add to `.env`:

```
AUTH_SECRET=<generated-secret>
```

## Verification

```bash
# Set AUTH_SECRET in .env
# Test sign-in flow
pnpm dev
```

Visit http://localhost:3000/sign-in

Demo credentials:

- Email: demo@example.com
- Password: demo123

## Summary

Phase 5 adds:

- ✅ NextAuth.js v5 configured
- ✅ Credentials provider
- ✅ OAuth providers (GitHub, Google)
- ✅ Auth UI components
- ✅ Protected route middleware
- ✅ User schema updated for passwords

## Next Up

[Phase 6: API Layer](06-api-layer.md)
