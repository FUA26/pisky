import { getDatabase } from "@/config/database";
import { hashToken, isTokenExpired } from "@/lib/tokens";
import { verifyEmailSchema } from "@/features/auth/validations/auth";
import { users, verificationTokens } from "@/features/database/models/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * POST /api/auth/verify-email
 * Verifies user email with token
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = verifyEmailSchema.parse(body);

    const { token } = validatedData;

    const db = getDatabase()!;

    // Hash the provided token to compare with stored hash
    const hashedToken = hashToken(token);

    // Find verification token in database
    const tokenResult = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, hashedToken))
      .limit(1);

    const storedToken = tokenResult[0];

    if (!storedToken) {
      return NextResponse.json(
        { error: "Invalid Token", message: "Invalid verification token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (isTokenExpired(storedToken.expires)) {
      // Delete expired token
      await db.delete(verificationTokens).where(eq(verificationTokens.token, hashedToken));

      return NextResponse.json(
        { error: "Expired Token", message: "Verification token has expired" },
        { status: 400 }
      );
    }

    // Find user by email (identifier)
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, storedToken.identifier))
      .limit(1);

    const user = userResult[0];

    if (!user) {
      return NextResponse.json(
        { error: "User Not Found", message: "User associated with this token not found" },
        { status: 404 }
      );
    }

    // Update user as verified
    await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, user.id));

    // Delete the verification token
    await db.delete(verificationTokens).where(eq(verificationTokens.token, hashedToken));

    console.log(`[Auth] Email verified for: ${user.email} (${user.id})`);

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully. You can now log in.",
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

    console.error("[Auth] Email verification error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to verify email" },
      { status: 500 }
    );
  }
}
