import { success, created, handleError, ApiErrorHelpers } from "@/shared/api";
import { validateBody, validateQuery, commonSchemas } from "@/shared/api/validation";
import { getDatabase } from "@/config/database";
import { users } from "@/features/database/models/schema";
import { eq, like, or, desc, sql, asc } from "drizzle-orm";
import { z } from "zod";
import type { NextRequest } from "next/server";

/**
 * Schema for creating a user
 */
const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  image: z.string().url("Invalid image URL").optional(),
});

/**
 * Schema for user query parameters
 */
const userQuerySchema = commonSchemas.pagination
  .merge(commonSchemas.search)
  .merge(commonSchemas.sort);

/**
 * GET /api/users - List all users with pagination and search
 */
export async function GET(request: NextRequest) {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = validateQuery(request.nextUrl.searchParams, userQuerySchema);

    const db = getDatabase();
    if (!db) throw ApiErrorHelpers.internal("Database not available");
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = search
      ? or(like(users.email, `%${search}%`), like(users.name, `%${search}%`))
      : undefined;

    // Get total count
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(users);
    if (conditions) {
      countQuery.where(conditions);
    }
    const [{ count }] = await countQuery;

    // Get paginated results with sorting
    const orderByColumn = sortBy === "name" ? users.name : users.createdAt;
    const orderByDirection = order === "asc" ? asc : desc;

    const result = await db
      .select()
      .from(users)
      .where(conditions)
      .orderBy(orderByDirection(orderByColumn))
      .limit(limit)
      .offset(offset);

    return success(result, {
      page,
      limit,
      total: Number(count),
      hasMore: page * limit < Number(count),
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/users - Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await validateBody(request, createUserSchema);

    const db = getDatabase();
    if (!db) throw ApiErrorHelpers.internal("Database not available");

    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, body.email)).limit(1);

    if (existing.length > 0) {
      throw ApiErrorHelpers.conflict("User with this email already exists");
    }

    // Create new user
    const [newUser] = await db!
      .insert(users)
      .values({
        email: body.email,
        name: body.name,
        image: body.image,
      } as any)
      .returning();

    return created(newUser);
  } catch (error) {
    return handleError(error);
  }
}
