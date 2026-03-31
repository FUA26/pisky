import { getDatabase } from "@/config/database";
import { sendTemplate } from "@/lib/email";
import { createSecureToken } from "@/lib/tokens";
import { registerSchema } from "@/features/auth/validations/auth";
import {
  users,
  roles,
  permissions,
  rolePermissions,
  verificationTokens,
} from "@/features/database/models/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/auth/register
 * Register a new user
 */
export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    const db = getDatabase()!;

    // Get default user role
    const userRole = await db.select().from(roles).where(eq(roles.name, "user")).limit(1);

    if (!userRole[0]) {
      return NextResponse.json(
        {
          error: "Configuration Error",
          message: "Default user role not found. Please run seed.",
        },
        { status: 500 }
      );
    }

    // Check if email already exists (but don't reveal this for security)
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser[0]) {
      // Always return success to prevent email enumeration
      console.log(`[Auth] Registration attempt with existing email: ${validatedData.email}`);

      return NextResponse.json(
        {
          message: "Registration successful. Please check your email to verify your account.",
          requireEmailVerification: true,
        },
        { status: 200 }
      );
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 10);

    // Create user
    const user = await db
      .insert(users)
      .values({
        name: validatedData.name,
        email: validatedData.email,
        passwordHash: hashedPassword,
        roleId: userRole[0].id,
        emailVerified: null, // Require email verification
      })
      .returning();

    // Generate verification token (24 hour expiration)
    const { token, hashed, expires } = createSecureToken(24);

    // Store verification token
    await db.insert(verificationTokens).values({
      identifier: user[0].email,
      token: hashed,
      expires,
    });

    // Send verification email
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${token}`;

    try {
      await sendTemplate("email-verification", {
        to: user[0].email,
        subject: "Verify Your Email Address",
        data: {
          userName: user[0].name ?? user[0].email,
          verifyUrl,
          expiryHours: 24,
        },
      });
      console.log(`[Auth] Verification email sent to: ${user[0].email}`);
    } catch (emailError) {
      console.error("[Auth] Failed to send verification email:", emailError);
    }

    // Send welcome email
    await sendTemplate("welcome", {
      to: user[0].email,
      subject: "Welcome to Pisky!",
      data: {
        userName: user[0].name || "there",
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
      },
    }).catch((error) => {
      console.error("[Auth] Failed to send welcome email:", error);
    });

    console.log(`[Auth] New user registered: ${user[0].email} (${user[0].id})`);

    return NextResponse.json(
      {
        message: "Registration successful. Please check your email to verify your account.",
        requireEmailVerification: true,
        userId: user[0].id,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation Error",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    const message = error instanceof Error ? error.message : "Registration failed";
    console.error("[Auth] Registration error:", error);
    return NextResponse.json(
      {
        error: "Server Error",
        message,
      },
      { status: 500 }
    );
  }
};
