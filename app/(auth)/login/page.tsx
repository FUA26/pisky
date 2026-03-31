import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign In - Pisky",
  description: "Sign in to your account",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-2 text-sm">Sign in to your account to continue</p>
        </div>
        <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
