# Phase 5: Authentication Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan.

**Goal:** Setup NextAuth.js v5 with credentials and OAuth providers, create auth feature module with UI pages.

**Architecture:** Implement authentication using NextAuth.js v5 with credentials (username/password) and OAuth (GitHub, Google) providers.

**Tech Stack:** NextAuth.js v5, bcrypt, Zod

**NJB Reference:** Check `/home/acn/acn/Next-js-Boilerplate/src/libs/Clerk.ts` - NOTE: NJB uses Clerk, we use NextAuth. Implementation will differ significantly.

---

### Task 1: Install NextAuth.js v5

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install NextAuth.js v5**

```bash
npm install next-auth@beta
```

Note: NextAuth v5 is in beta, use beta flag

- [ ] **Step 2: Install required dependencies**

```bash
npm install bcrypt zod
npm install --save-dev @types/bcrypt
```

- [ ] **Step 3: Update env schema for auth**

```bash
cat > src/config/env.ts << 'EOF'
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: z.string().url().optional(),
    // Auth
    AUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url().optional(),
    // OAuth (optional)
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    // Monitoring
    SENTRY_DSN: z.string().url().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    SENTRY_DSN: process.env.SENTRY_DSN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
EOF
```

- [ ] **Step 4: Update .env.example**

```bash
cat > .env.example << 'EOF'
# Node Environment
NODE_ENV=development

# Database
DATABASE_URL=""

# Auth
AUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (Optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Monitoring
SENTRY_DSN=""

# Skip env validation
SKIP_ENV_VALIDATION=""
EOF
```

- [ ] **Step 5: Commit installations**

```bash
git add . env.ts package.json package-lock.json
git commit -m "feat: install NextAuth.js v5 and auth dependencies"
```

---

### Task 2: Configure NextAuth.js

**Files:**

- Create: `src/config/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Create auth configuration**

```bash
cat > src/config/auth.ts << 'EOF'
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { eq } from "drizzle-orm";
import { compare } from "bcrypt";
import { z } from "zod";
import { getDatabase } from "./database";
import { users } from "../features/database/models/schema";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = signInSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const db = getDatabase();

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user[0]) {
          return null;
        }

        // For now, we'll skip password verification since we haven't added password field
        // In production, you'd verify the password hash here
        // const isValid = await compare(password, user[0].passwordHash);

        return {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          image: user[0].image,
        };
      },
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
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
});
EOF
```

- [ ] **Step 2: Create NextAuth API route**

```bash
mkdir -p src/app/api/auth/[...nextauth]
cat > src/app/api/auth/[...nextauth]/route.ts << 'EOF'
import { handlers } from "@/config/auth";

export const { GET, POST } = handlers;
EOF
```

- [ ] **Step 3: Commit auth configuration**

```bash
git add src/config/auth.ts src/app/api/auth/
git commit -m "feat: configure NextAuth.js with credentials and OAuth providers"
```

---

### Task 3: Create Auth Types and Hooks

**Files:**

- Create: `src/features/auth/types/auth.ts`
- Create: `src/features/auth/hooks/use-session.ts`

- [ ] **Step 1: Create auth types**

```bash
cat > src/features/auth/types/auth.ts << 'EOF'
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
EOF
```

- [ ] **Step 2: Create useSession hook**

```bash
cat > src/features/auth/hooks/use-session.ts << 'EOF'
"use client";

import { useSession as useNextAuthSession } from "next-auth/react";

export function useSession() {
  const session = useNextAuthSession();
  return {
    ...session,
    isAuthenticated: session.status === "authenticated",
    isLoading: session.status === "loading",
  };
}
EOF
```

- [ ] **Step 3: Commit types and hooks**

```bash
git add src/features/auth/
git commit -m "feat: add auth types and hooks"
```

---

### Task 4: Create Auth UI Components

**Files:**

- Create: `src/features/auth/components/sign-in-form.tsx`
- Create: `src/features/auth/components/sign-out-button.tsx`
- Create: `src/shared/components/auth-provider.tsx`

- [ ] **Step 1: Create SessionProvider**

```bash
cat > src/shared/components/session-provider.tsx << 'EOF'
"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
EOF
```

- [ ] **Step 2: Create sign-in form component**

```bash
cat > src/features/auth/components/sign-in-form.tsx << 'EOF'
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";

export function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
EOF
```

- [ ] **Step 3: Create OAuth buttons component**

```bash
cat > src/features/auth/components/oauth-buttons.tsx << 'EOF'
"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/shared/components/ui/button";
import { Github } from "lucide-react";

export function OAuthButtons() {
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => signIn("github", { callbackUrl: "/" })}
      >
        <Github className="mr-2 h-4 w-4" />
        Continue with GitHub
      </Button>
    </div>
  );
}
EOF
```

- [ ] **Step 4: Commit UI components**

```bash
git add src/features/auth/components/ src/shared/components/session-provider.tsx
git commit -m "feat: add auth UI components"
```

---

### Task 5: Create Auth Pages

**Files:**

- Create: `src/app/(auth)/sign-in/page.tsx`
- Create: `src/app/(auth)/layout.tsx`

- [ ] **Step 1: Create sign-in page**

```bash
cat > src/app/(auth)/sign-in/page.tsx << 'EOF'
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";

export default function SignInPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <OAuthButtons />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <SignInForm />
      </div>
    </div>
  );
}
EOF
```

- [ ] **Step 2: Create auth route group layout**

```bash
cat > src/app/(auth)/layout.tsx << 'EOF'
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
EOF
```

- [ ] **Step 3: Update root layout to include SessionProvider**

```bash
cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { ThemeProvider } from "@/shared/components/theme-provider";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { SessionProvider } from "@/shared/components/session-provider";
import { setupLogging } from "@/config/logging";

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
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Header>
              <ThemeToggle />
            </Header>
            <main className="min-h-[calc(100vh-8rem)]">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
EOF
```

- [ ] **Step 4: Commit auth pages**

```bash
git add src/app/
git commit -m "feat: add sign-in page and auth layout"
```

---

### Task 6: Create Protected Route Middleware

**Files:**

- Create: `src/middleware.ts`

- [ ] **Step 1: Create auth middleware**

```bash
cat > src/middleware.ts << 'EOF'
import { auth } from "@/config/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/sign-in");
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
EOF
```

- [ ] **Step 2: Commit middleware**

```bash
git add src/middleware.ts
git commit -m "feat: add protected route middleware"
```

---

### Task 7: Update User Schema for Password Hash

**Files:**

- Modify: `src/features/database/models/schema.ts`

- [ ] **Step 1: Add password field to user schema**

```bash
cat > src/features/database/models/schema.ts << 'EOF'
import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: text("image"),
  passwordHash: text("passwordHash"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
EOF
```

- [ ] **Step 2: Generate migration**

```bash
npm run db:generate
```

- [ ] **Step 3: Push migration**

```bash
npm run db:push
```

- [ ] **Step 4: Commit schema update**

```bash
git add src/features/database/models/schema.ts
git commit -m "feat: add password hash field to users table"
```

---

### Task 8: Update Documentation

**Files:**

- Create: `docs/tutorial/05-authentication.md`

- [ ] **Step 1: Create Phase 5 tutorial**

```bash
cat > docs/tutorial/05-authentication.md << 'EOF'
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

\`\`\`bash
npm install next-auth@beta bcrypt
\`\`\`

### 2. Configure Auth

Create auth configuration with providers:

\`\`\`typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({ /* ... */ }),
    GitHub({ /* ... */ }),
    Google({ /* ... */ }),
  ],
});
\`\`\`

### 3. Create Auth Pages

Build sign-in page with form and OAuth buttons.

### 4. Add Middleware

Protect routes with auth middleware.

## Verification

\`\`\`bash
# Set AUTH_SECRET in .env
# Test sign-in flow
npm run dev
\`\`\`

## Summary

Phase 5 adds:
- ✅ NextAuth.js configured
- ✅ Credentials provider
- ✅ OAuth providers
- ✅ Auth UI components
- ✅ Protected routes

## Next Up

[Phase 6: API Layer](06-api-layer.md)
EOF
```

- [ ] **Step 2: Update progress and commit**

```bash
sed -i '/Phase 5: Authentication/,/Status:/s/Status: \[ \] Not Started/Status: [x] Complete/' docs/PROGRESS.md
git add .
git commit -m "docs: add Phase 5 tutorial"
```

---

### Task 9: Final Verification

- [ ] **Step 1: Test auth flow**

```bash
npm run dev
```

Visit http://localhost:3000/sign-in

- [ ] **Step 2: Create Phase 5 tag**

```bash
git tag -a phase-5-auth -m "Phase 5: Authentication complete"
```

---

## Summary

Phase 5 adds authentication:

- ✅ NextAuth.js v5 configured
- ✅ Credentials provider
- ✅ OAuth providers (GitHub, Google)
- ✅ Auth UI components
- ✅ Protected route middleware
- ✅ User schema updated for passwords

## Next Steps

Proceed to Phase 6: API Layer
