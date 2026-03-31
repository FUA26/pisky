"use client";

import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/password-input";
import { resetPasswordSchema, type ResetPasswordInput } from "@/features/auth/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to reset password");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
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
              <h1 className="text-foreground text-xl font-semibold">Invalid Reset Link</h1>
              <p className="text-muted-foreground text-sm">
                This password reset link is invalid. Please request a new one.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/forgot-password">Request New Link</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
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
              <h1 className="text-foreground text-xl font-semibold">Password Reset Successful</h1>
              <p className="text-muted-foreground text-sm">
                Your password has been reset successfully. You can now log in with your new
                password.
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
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-muted-foreground mt-2 text-sm">Enter your new password below</p>
        </div>
        <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            <PasswordInput
              id="password"
              label="New Password"
              placeholder="Minimum 8 characters"
              disabled={isLoading}
              error={form.formState.errors.password?.message}
              registration={form.register("password")}
            />

            <PasswordInput
              id="confirmPassword"
              label="Confirm New Password"
              placeholder="Re-enter your password"
              disabled={isLoading}
              error={form.formState.errors.confirmPassword?.message}
              registration={form.register("confirmPassword")}
            />

            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 w-full rounded-xl font-medium shadow-sm transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>

            <div className="text-center text-sm">
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
