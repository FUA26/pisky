"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export const metadata = {
  title: "Verify Email - Pisky",
  description: "Verify your email address",
};

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(!!token);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setError("Invalid verification link");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Verification failed");
        }

        if (result.alreadyVerified) {
          setIsAlreadyVerified(true);
        }

        setIsSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="border-border bg-card space-y-6 rounded-2xl border p-8 text-center shadow-sm">
            <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
            <div className="space-y-2">
              <h1 className="text-foreground text-xl font-semibold">Verifying your email...</h1>
              <p className="text-muted-foreground text-sm">
                Please wait while we verify your email address.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess || isAlreadyVerified) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="border-border bg-card space-y-6 rounded-2xl border p-8 text-center shadow-sm">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2
                  className="h-8 w-8 text-green-600 dark:text-green-400"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-foreground text-xl font-semibold">
                {isAlreadyVerified ? "Email Already Verified" : "Email Verified Successfully"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isAlreadyVerified
                  ? "Your email has already been verified. You can now log in to your account."
                  : "Your email has been verified successfully. You can now log in to your account."}
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border-border bg-card space-y-6 rounded-2xl border p-8 text-center shadow-sm">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-foreground text-xl font-semibold">Verification Failed</h1>
            <p className="text-muted-foreground text-sm">
              {error || "Invalid or expired verification link"}
            </p>
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/register">Back to Register</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
