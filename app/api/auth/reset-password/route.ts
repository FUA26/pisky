import { getDatabase } from "@/config/database";
import { sendTemplate } from "@/lib/email";
import { hashToken, isTokenExpired } from "@/lib/tokens";
import { resetPasswordSchema } from "@/features/auth/validations/auth";
import { users } from "@/features/database/models/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * POST /api/auth/reset-password
 * Resets user password with valid token
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = resetPasswordSchema.parse(body);

    const { token, password } = validatedData;

    const db = getDatabase()!;

    // Hash the provided token to compare with stored hash
    const hashedToken = hashToken(token);

    // Find user with this reset token
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, hashedToken))
      .limit(1);

    const user = userResult[0];

    if (!user) {
      return NextResponse.json(
        { error: "Invalid Token", message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (isTokenExpired(user.passwordResetExpires)) {
      return NextResponse.json(
        { error: "Expired Token", message: "Reset token has expired" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    await db
      .update(users)
      .set({
        passwordHash: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      })
      .where(eq(users.id, user.id));

    // Send confirmation email
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`;

    await sendTemplate("password-reset-confirm", {
      to: user.email,
      subject: "Password Successfully Reset",
      data: {
        userName: user.name ?? user.email?.split("@")[0] ?? "User",
        loginUrl,
      },
    }).catch((error) => {
      console.error("[Auth] Failed to send password reset confirmation email:", error);
    });

    console.log(`[Auth] Password reset completed for: ${user.email} (${user.id})`);

    return NextResponse.json(
      {
        success: true,
        message: "Password has been reset successfully. Please log in with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation Error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("[Auth] Password reset error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to reset password" },
      { status: 500 }
    );
  }
}
