import { getDatabase } from "@/config/database";
import { sendTemplate } from "@/lib/email";
import { createSecureToken } from "@/lib/tokens";
import { forgotPasswordSchema } from "@/features/auth/validations/auth";
import { users } from "@/features/database/models/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * POST /api/auth/forgot-password
 * Initiates password reset flow
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = forgotPasswordSchema.parse(body);

    const db = getDatabase()!;

    // Find user by email
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    const user = userResult[0];

    // Always return success, even if user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists with that email, a password reset link has been sent.",
        },
        { status: 200 }
      );
    }

    // Generate secure reset token (1 hour expiration)
    const { token, hashed, expires } = createSecureToken(1);

    // Store token in database
    await db
      .update(users)
      .set({
        passwordResetToken: hashed,
        passwordResetExpires: expires,
      })
      .where(eq(users.id, user.id));

    // Generate reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    // Send reset email
    const result = await sendTemplate("password-reset", {
      to: user.email,
      subject: "Reset Your Password",
      data: {
        userName: user.name ?? user.email?.split("@")[0] ?? "User",
        resetUrl,
        expiryHours: 1,
      },
    });

    if (!result.success) {
      console.error("Failed to send password reset email:", result.error);
    }

    return NextResponse.json(
      {
        success: true,
        message: "If an account exists with that email, a password reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation Error", message: "Invalid email format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to process request" },
      { status: 500 }
    );
  }
}
