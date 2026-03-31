"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const metadata = {
  title: "Forgot Password - Pisky",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send reset email");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-foreground text-3xl font-bold tracking-tight">Check your email</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              We've sent a password reset link to your email address.
            </p>
          </div>
          <div className="border-border bg-card space-y-6 rounded-2xl border p-8 text-center shadow-sm">
            <div className="flex justify-center">
              <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
                <Mail className="text-primary h-8 w-8" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
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
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Forgot password?</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter your email address and we'll send you a reset link
          </p>
        </div>
        <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail
                  className="text-muted-foreground/60 absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2"
                  strokeWidth={1.5}
                />
                <Input
                  id="email"
                  {...form.register("email")}
                  type="email"
                  placeholder="Enter your email"
                  disabled={isLoading}
                  aria-describedby={form.formState.errors.email ? "email-error" : undefined}
                  aria-invalid={!!form.formState.errors.email}
                  className="bg-background border-muted/80 focus-visible:ring-primary h-11 rounded-xl pl-10 shadow-none focus-visible:ring-1"
                />
              </div>
              {form.formState.errors.email && (
                <p id="email-error" className="text-destructive text-sm">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 w-full rounded-xl font-medium shadow-sm transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center text-sm">
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground inline-flex items-center transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
