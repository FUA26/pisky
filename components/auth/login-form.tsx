"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/auth/password-input";
import { loginSchema, type LoginInput } from "@/features/auth/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, ArrowRight } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        // Redirect to callback URL or dashboard
        router.push(callbackUrl || "/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            className="bg-background border-muted/80 focus-visible:ring-primary h-11 rounded-xl pl-10 shadow-none focus-visible:ring-1"
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
        )}
      </div>

      <PasswordInput
        id="password"
        label="Password"
        placeholder="Enter your password"
        disabled={isLoading}
        error={form.formState.errors.password?.message}
        registration={form.register("password")}
      />

      <div className="flex items-center justify-between py-1 text-sm">
        <div className="flex items-center gap-2">
          <Checkbox id="remember" className="h-4 w-4 rounded-sm" />
          <label htmlFor="remember" className="text-muted-foreground cursor-pointer select-none">
            Remember me
          </label>
        </div>
        <Link
          href="/forgot-password"
          className="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 w-full rounded-xl font-medium shadow-sm transition-colors"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="pt-2 text-center text-sm">
        <span className="text-muted-foreground mr-1">Don't have an account?</span>
        <Link
          href="/register"
          className="text-primary hover:text-primary/80 inline-flex items-center font-semibold transition-colors"
        >
          Sign up <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </form>
  );
}
