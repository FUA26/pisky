"use client";

import { useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { SessionProvider } from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";

// Initialize Sentry on client only
import "@/sentry.client.config";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
