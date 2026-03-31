import { success, handleError, ApiErrorHelpers } from "@/shared/api";
import { validateParams, uuidSchema, validateBody } from "@/shared/api/validation";
import { getDatabase } from "@/config/database";
import { users } from "@/features/database/models/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { NextRequest } from "next/server";

/**
 * Schema for updating a user
 */
const updateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  image: z.string().url("Invalid image URL").optional(),
});

/**
 * GET /api/users/:id - Get a user by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = validateParams(await params, uuidSchema());

    const db = getDatabase();
    if (!db) throw ApiErrorHelpers.internal("Database not available");
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (!user) {
      throw ApiErrorHelpers.notFound("User not found");
    }

    return success(user);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/users/:id - Update a user
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = validateParams(await params, uuidSchema());
    const body = await validateBody(request, updateUserSchema);

    const db = getDatabase();
    if (!db) throw ApiErrorHelpers.internal("Database not available");

    // Check if user exists
    const [existing] = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (!existing) {
      throw ApiErrorHelpers.notFound("User not found");
    }

    // Check if email is being changed and already exists
    if (body.email && body.email !== existing.email) {
      const [emailCheck] = await db!
        .select()
        .from(users)
        .where(eq(users.email, body.email))
        .limit(1);

      if (emailCheck) {
        throw ApiErrorHelpers.conflict("Email already in use");
      }
    }

    // Update user
    const [updatedUser] = await db!
      .update(users)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return success(updatedUser);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/users/:id - Delete a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = validateParams(await params, uuidSchema());

    const db = getDatabase();
    if (!db) throw ApiErrorHelpers.internal("Database not available");

    // Check if user exists
    const [existing] = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (!existing) {
      throw ApiErrorHelpers.notFound("User not found");
    }

    // Delete user
    await db!.delete(users).where(eq(users.id, id));

    return success({ message: "User deleted successfully" });
  } catch (error) {
    return handleError(error);
  }
}
