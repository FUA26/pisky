"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug, RefreshCw } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

export default function TestSentryPage() {
  const throwTestError = () => {
    try {
      throw new Error("This is a test error from Sentry integration!");
    } catch (error) {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          tags: {
            test: "true",
            page: "test-sentry",
          },
          extra: {
            message: "This is a test error to verify Sentry is working",
          },
        });
        alert("Error sent to Sentry! Check your dashboard or Spotlight.");
      }
    }
  };

  const throwUnhandledError = () => {
    // This will be caught by the error boundary
    throw new Error("Unhandled test error - caught by ErrorBoundary!");
  };

  const captureMessage = () => {
    Sentry.captureMessage("Test message from Sentry", {
      level: "info",
      tags: {
        test: "true",
        type: "message",
      },
    });
    alert("Message sent to Sentry!");
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Sentry Error Testing</h1>
          <p className="text-muted-foreground">
            Use this page to test Sentry error tracking and Spotlight integration.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="size-5" />
              Test Actions
            </CardTitle>
            <CardDescription>
              Click the buttons below to test different error scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <Button onClick={throwTestError} variant="default">
                Send Test Error to Sentry
              </Button>
              <Button onClick={captureMessage} variant="outline">
                Send Test Message to Sentry
              </Button>
              <Button onClick={throwUnhandledError} variant="destructive">
                Throw Unhandled Error (Test Error Boundary)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spotlight Integration</CardTitle>
            <CardDescription>In development, errors are also shown in Spotlight</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Visit <code className="bg-muted rounded px-1 py-0.5">http://localhost:8969</code> to
              see Spotlight
            </p>
            <p className="text-muted-foreground">
              Note: Make sure NEXT_PUBLIC_SENTRY_DSN is set in your .env.local for production errors
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
