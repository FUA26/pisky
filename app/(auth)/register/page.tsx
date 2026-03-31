import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Sign Up - Pisky",
  description: "Create a new account",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Create an account</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Get started with your free account today
          </p>
        </div>
        <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
