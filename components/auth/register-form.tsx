"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PasswordInput } from "@/components/auth/password-input";
import { registerSchema, type RegisterInput } from "@/features/auth/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = form.watch("password");

  // Password strength calculator
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: "Weak", color: "bg-red-500" };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 25, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { score: 50, label: "Fair", color: "bg-yellow-500" };
    if (score <= 3) return { score: 75, label: "Good", color: "bg-blue-500" };
    return { score: 100, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(passwordValue || "");

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      setRegistrationSuccess(true);
    } catch (error) {
      console.error("Registration failed:", error);
      form.setError("root", {
        message: error instanceof Error ? error.message : "Registration failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message if registration completed
  if (registrationSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h3 className="text-foreground text-xl font-semibold">Registration Successful!</h3>
          <p className="text-muted-foreground text-sm">
            We've sent a verification email to your address. Please check your email to activate
            your account.
          </p>
        </div>

        <div className="w-full space-y-4 pt-4">
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 w-full rounded-xl font-medium shadow-sm transition-colors"
          >
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {form.formState.errors.root && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {form.formState.errors.root.message}
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground text-sm font-medium">
          Full Name
        </Label>
        <div className="relative">
          <User
            className="text-muted-foreground/60 absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2"
            strokeWidth={1.5}
          />
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            disabled={isLoading}
            {...form.register("name")}
            aria-describedby={form.formState.errors.name ? "name-error" : undefined}
            aria-invalid={!!form.formState.errors.name}
            className="bg-background border-muted/80 focus-visible:ring-primary h-11 rounded-xl pl-10 shadow-none focus-visible:ring-1"
          />
        </div>
        {form.formState.errors.name && (
          <p id="name-error" className="text-destructive text-sm">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
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
            type="email"
            placeholder="name@example.com"
            disabled={isLoading}
            {...form.register("email")}
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

      {/* Password */}
      <PasswordInput
        id="password"
        label="Password"
        placeholder="Minimum 8 characters"
        disabled={isLoading}
        error={form.formState.errors.password?.message}
        registration={form.register("password")}
      />

      {/* Password Strength Indicator */}
      {passwordValue && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Password strength:</span>
            <span
              className={`font-medium ${
                passwordStrength.score === 25
                  ? "text-red-500"
                  : passwordStrength.score === 50
                    ? "text-yellow-500"
                    : passwordStrength.score === 75
                      ? "text-blue-500"
                      : "text-green-500"
              }`}
            >
              {passwordStrength.label}
            </span>
          </div>
          <Progress value={passwordStrength.score} className="h-1.5 rounded-full" />
        </div>
      )}

      {/* Confirm Password */}
      <div className="space-y-2 pb-2">
        <Label htmlFor="confirmPassword" className="text-foreground text-sm font-medium">
          Confirm Password
        </Label>
        <div className="relative">
          <Eye
            className="text-muted-foreground/60 absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2"
            strokeWidth={1.5}
          />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            disabled={isLoading}
            {...form.register("confirmPassword")}
            aria-describedby={
              form.formState.errors.confirmPassword ? "confirmPassword-error" : undefined
            }
            aria-invalid={!!form.formState.errors.confirmPassword}
            className="bg-background border-muted/80 focus-visible:ring-primary h-11 rounded-xl pr-10 pl-10 shadow-none focus-visible:ring-1"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            aria-pressed={showConfirmPassword}
            className="text-muted-foreground/60 hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-3 -translate-y-1/2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Eye className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
        {form.formState.errors.confirmPassword && (
          <p id="confirmPassword-error" className="text-destructive text-sm">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 w-full rounded-xl font-medium shadow-sm transition-colors"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>

      {/* Login Link */}
      <p className="pt-2 text-center text-sm">
        <span className="text-muted-foreground mr-1">Already have an account?</span>
        <Link
          href="/login"
          className="text-primary hover:text-primary/80 font-semibold transition-colors"
        >
          Sign in <ArrowRight className="mb-0.5 ml-0.5 inline-block h-3.5 w-3.5" />
        </Link>
      </p>
    </form>
  );
}
