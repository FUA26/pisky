import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Unauthorized - Pisky",
  description: "You don't have permission to access this page",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border-border bg-card space-y-6 rounded-2xl border p-8 text-center shadow-sm">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
              <AlertTriangle
                className="h-8 w-8 text-yellow-600 dark:text-yellow-400"
                strokeWidth={1.5}
              />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-foreground text-xl font-semibold">Access Denied</h1>
            <p className="text-muted-foreground text-sm">
              You don't have permission to access this page. Please contact your administrator if
              you believe this is an error.
            </p>
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
