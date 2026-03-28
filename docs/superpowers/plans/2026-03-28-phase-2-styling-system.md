# Phase 2: Styling System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Setup Tailwind CSS 4 with flexible theming using CSS variables, initialize Shadcn UI, and install base components.

**Architecture:** Configure Tailwind CSS 4 with CSS variable-based theming system. Initialize Shadcn UI for component library. Create shared layout components.

**Tech Stack:** Tailwind CSS 4, Shadcn UI, CSS Variables

**NJB Reference:** Before starting, check `/home/acn/acn/Next-js-Boilerplate` for:
- Tailwind configuration
- CSS variables setup
- Component library patterns

---

### Task 1: Upgrade to Tailwind CSS 4

**Files:**
- Modify: `package.json`
- Create: `src/app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Check current Tailwind version**

```bash
cat package.json | grep tailwindcss
```

Expected: Tailwind CSS 3.x installed by create-next-app

- [ ] **Step 2: Check NJB Tailwind configuration**

```bash
cat /home/acn/acn/Next-js-Boilerplate/tailwind.config.ts
cat /home/acn/acn/Next-js-Boilerplate/src/app/globals.css
```

- [ ] **Step 3: Install Tailwind CSS 4**

```bash
npm install tailwindcss@next @tailwindcss/postcss@next
```

- [ ] **Step 4: Update postcss configuration**

```bash
cat > postcss.config.mjs << 'EOF'
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
EOF
```

- [ ] **Step 5: Update tailwind.config.ts for CSS variables**

```bash
cat > tailwind.config.ts << 'EOF'
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
EOF
```

- [ ] **Step 6: Update globals.css with CSS variables**

```bash
cat > src/app/globals.css << 'EOF'
@import "tailwindcss";

@layer theme {
  :root {
    --color-background: 0 0% 100%;
    --color-foreground: 222.2 84% 4.9%;
    --color-primary: 221.2 83.2% 53.3%;
    --color-primary-foreground: 210 40% 98%;
    --color-secondary: 210 40% 96.1%;
    --color-secondary-foreground: 222.2 47.4% 11.2%;
    --color-accent: 210 40% 96.1%;
    --color-accent-foreground: 222.2 47.4% 11.2%;
    --color-muted: 210 40% 96.1%;
    --color-muted-foreground: 215.4 16.3% 46.9%;
    --color-card: 0 0% 100%;
    --color-card-foreground: 222.2 84% 4.9%;
    --color-border: 214.3 31.8% 91.4%;
    --color-input: 214.3 31.8% 91.4%;
    --color-ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --color-background: 222.2 84% 4.9%;
    --color-foreground: 210 40% 98%;
    --color-primary: 217.2 91.2% 59.8%;
    --color-primary-foreground: 222.2 47.4% 11.2%;
    --color-secondary: 217.2 32.6% 17.5%;
    --color-secondary-foreground: 210 40% 98%;
    --color-accent: 217.2 32.6% 17.5%;
    --color-accent-foreground: 210 40% 98%;
    --color-muted: 217.2 32.6% 17.5%;
    --color-muted-foreground: 215 20.2% 65.1%;
    --color-card: 222.2 84% 4.9%;
    --color-card-foreground: 210 40% 98%;
    --color-border: 217.2 32.6% 17.5%;
    --color-input: 217.2 32.6% 17.5%;
    --color-ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
EOF
```

- [ ] **Step 7: Install tailwindcss-animate**

```bash
npm install tailwindcss-animate
```

- [ ] **Step 8: Commit Tailwind CSS 4 setup**

```bash
git add .
git commit -m "feat: upgrade to Tailwind CSS 4 with CSS variable theming"
```

---

### Task 2: Initialize Shadcn UI

**Files:**
- Create: `components.json`
- Create: `src/shared/components/ui/`

- [ ] **Step 1: Install Shadcn UI CLI**

```bash
npx shadcn@latest init --yes --defaults
```

Expected: Shadcn UI initialized

- [ ] **Step 2: Configure components.json for pisky structure**

```bash
cat > components.json << 'EOF'
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/shared/components",
    "utils": "@/shared/utils",
    "ui": "@/shared/components/ui",
    "lib": "@/shared/utils",
    "hooks": "@/shared/hooks"
  }
}
EOF
```

- [ ] **Step 3: Create utils file for cn function**

```bash
cat > src/shared/utils/cn.ts << 'EOF'
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
EOF
```

- [ ] **Step 4: Install required dependencies**

```bash
npm install clsx tailwind-merge class-variance-authority lucide-react
```

- [ ] **Step 5: Commit Shadcn UI initialization**

```bash
git add .
git commit -m "feat: initialize Shadcn UI with pisky structure"
```

---

### Task 3: Install Base UI Components

**Files:**
- Create: `src/shared/components/ui/button.tsx`
- Create: `src/shared/components/ui/input.tsx`
- Create: `src/shared/components/ui/card.tsx`
- Create: `src/shared/components/ui/label.tsx`

- [ ] **Step 1: Add Button component**

```bash
npx shadcn@latest add button --yes
```

- [ ] **Step 2: Add Input component**

```bash
npx shadcn@latest add input --yes
```

- [ ] **Step 3: Add Card component**

```bash
npx shadcn@latest add card --yes
```

- [ ] **Step 4: Add Label component**

```bash
npx shadcn@latest add label --yes
```

- [ ] **Step 5: Verify components are in correct location**

```bash
ls -la src/shared/components/ui/
```

Expected: button.tsx, input.tsx, card.tsx, label.tsx present

- [ ] **Step 6: Commit base components**

```bash
git add .
git commit -m "feat: add base UI components from Shadcn"
```

---

### Task 4: Create Shared Layout Components

**Files:**
- Create: `src/shared/components/layout/header.tsx`
- Create: `src/shared/components/layout/footer.tsx`

- [ ] **Step 1: Create Header component**

```bash
cat > src/shared/components/layout/header.tsx << 'EOF'
import { ReactNode } from "react";

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">Pisky</span>
          </a>
        </div>
        {children}
      </div>
    </header>
  );
}
EOF
```

- [ ] **Step 2: Create Footer component**

```bash
cat > src/shared/components/layout/footer.tsx << 'EOF'
import { ReactNode } from "react";

interface FooterProps {
  children?: ReactNode;
}

export function Footer({ children }: FooterProps) {
  return (
    <footer className="border-t border-border/40 py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built with <a href="#" className="font-medium underline underline-offset-4">Pisky Boilerplate</a>
        </p>
        {children}
      </div>
    </footer>
  );
}
EOF
```

- [ ] **Step 3: Update root layout to use Header and Footer**

```bash
cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";

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
        <Header />
        <main className="min-h-[calc(100vh-8rem)]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
EOF
```

- [ ] **Step 4: Commit layout components**

```bash
git add .
git commit -m "feat: add Header and Footer layout components"
```

---

### Task 5: Create Theme Provider

**Files:**
- Create: `src/shared/components/theme-provider.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Install next-themes**

```bash
npm install next-themes
```

- [ ] **Step 2: Create ThemeProvider component**

```bash
cat > src/shared/components/theme-provider.tsx << 'EOF'
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
EOF
```

- [ ] **Step 3: Add theme toggle component**

```bash
cat > src/shared/components/theme-toggle.tsx << 'EOF'
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/shared/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
EOF
```

- [ ] **Step 4: Update layout to include ThemeProvider**

```bash
cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { ThemeProvider } from "@/shared/components/theme-provider";
import { ThemeToggle } from "@/shared/components/theme-toggle";

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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header>
            <ThemeToggle />
          </Header>
          <main className="min-h-[calc(100vh-8rem)]">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
EOF
```

- [ ] **Step 5: Commit theme provider**

```bash
git add .
git commit -m "feat: add theme provider with dark mode support"
```

---

### Task 6: Update Home Page with Components

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update home page to showcase components**

```bash
cat > src/app/page.tsx << 'EOF'
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default function HomePage() {
  return (
    <main className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Pisky Boilerplate</h1>
          <p className="text-muted-foreground text-lg">
            A personalized Next.js 16+ boilerplate with feature-based architecture
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Phase 1 Complete</CardTitle>
              <CardDescription>Project Foundation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Next.js 16, TypeScript, ESLint, Prettier configured
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phase 2 Complete</CardTitle>
              <CardDescription>Styling System</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tailwind CSS 4, Shadcn UI, Theme support ready
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 justify-center">
          <Button>Get Started</Button>
          <Button variant="outline">Documentation</Button>
        </div>
      </div>
    </main>
  );
}
EOF
```

- [ ] **Step 2: Commit home page update**

```bash
git add src/app/page.tsx
git commit -m "feat: update home page with component showcase"
```

---

### Task 7: Create Documentation

**Files:**
- Create: `docs/tutorial/02-styling-system.md`
- Modify: `README.md`

- [ ] **Step 1: Create Phase 2 tutorial**

```bash
cat > docs/tutorial/02-styling-system.md << 'EOF'
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

### 1. Upgrade to Tailwind CSS 4

\`\`\`bash
npm install tailwindcss@next @tailwindcss/postcss@next
\`\`\`

### 2. Configure CSS Variables

Define semantic color tokens:

\`\`\`css
:root {
  --color-background: 0 0% 100%;
  --color-foreground: 222.2 84% 4.9%;
  --color-primary: 221.2 83.2% 53.3%;
  /* ... more colors */
}
\`\`\`

### 3. Initialize Shadcn UI

\`\`\`bash
npx shadcn@latest init --yes --defaults
\`\`\`

### 4. Add Base Components

\`\`\`bash
npx shadcn@latest add button input card label
\`\`\`

### 5. Create Layout Components

Build reusable Header and Footer components.

### 6. Add Theme Support

Implement dark mode with next-themes.

## Verification

\`\`\`bash
# Check components render
npm run dev

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

[Phase 3: Core Infrastructure](03-core-infrastructure.md)
EOF
```

- [ ] **Step 2: Update README**

```bash
# Add Phase 2 status
sed -i 's/✅ Phase 1: Project Foundation - Complete/✅ Phase 1: Project Foundation - Complete\n✅ Phase 2: Styling System - Complete/' README.md
```

- [ ] **Step 3: Update progress tracker**

```bash
# Update Phase 2 as complete
sed -i '/Phase 2: Styling System/,/Status:/s/Status: \[ \] Not Started/Status: [x] Complete/' docs/PROGRESS.md
```

- [ ] **Step 4: Commit documentation**

```bash
git add .
git commit -m "docs: add Phase 2 tutorial and update status"
```

---

### Task 8: Final Verification

**Files:**
- None (verification only)

- [ ] **Step 1: Run all checks**

```bash
npm run lint
npm run format:check
npx tsc --noEmit
```

Expected: All checks pass

- [ ] **Step 2: Test build**

```bash
npm run build
```

Expected: Build succeeds

- [ ] **Step 3: Create Phase 2 tag**

```bash
git tag -a phase-2-styling -m "Phase 2: Styling System complete"
```

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: Phase 2 styling system complete"
```

---

## Summary

Phase 2 establishes the styling system with:

✅ Tailwind CSS 4 configured
✅ CSS variable theming system
✅ Shadcn UI initialized
✅ Base UI components installed
✅ Layout components created
✅ Dark mode support added

## Next Steps

Proceed to [Phase 3: Core Infrastructure](/home/acn/acn/pisky/docs/superpowers/plans/2026-03-28-phase-3-core-infrastructure.md)
