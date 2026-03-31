"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface PasswordInputProps {
  id: string;
  name?: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  registration?: ReturnType<typeof import("react-hook-form").useRegister>;
}

export function PasswordInput({
  id,
  name,
  label,
  placeholder = "Enter password",
  disabled = false,
  error,
  registration,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-foreground text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Lock
          className="text-muted-foreground/60 absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2"
          strokeWidth={1.5}
        />
        <Input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          disabled={disabled}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
          className="bg-background border-muted/80 focus-visible:ring-primary h-11 rounded-xl pr-10 pl-10 shadow-none focus-visible:ring-1"
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          className="text-muted-foreground/60 hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-3 -translate-y-1/2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" strokeWidth={1.5} />
          ) : (
            <Eye className="h-5 w-5" strokeWidth={1.5} />
          )}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
