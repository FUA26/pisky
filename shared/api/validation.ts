import { z, type ZodSchema, type ZodError } from "zod";
import type { NextRequest } from "next/server";
import { ApiErrorHelpers } from "./error-handler";

/**
 * Validate request body against a Zod schema
 */
export async function validateBody<T>(request: NextRequest, schema: ZodSchema<T>): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiErrorHelpers.badRequest("Validation failed", error.issues);
    }
    throw ApiErrorHelpers.badRequest("Invalid request body");
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T>(searchParams: URLSearchParams, schema: ZodSchema<T>): T {
  try {
    const params = Object.fromEntries(searchParams.entries());

    // Handle numeric and boolean conversions
    const processed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(params)) {
      // Try parsing as number
      if (/^\d+$/.test(value)) {
        processed[key] = parseInt(value, 10);
      }
      // Try parsing as boolean
      else if (value === "true") {
        processed[key] = true;
      } else if (value === "false") {
        processed[key] = false;
      }
      // Keep as string
      else {
        processed[key] = value;
      }
    }

    return schema.parse(processed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiErrorHelpers.badRequest("Invalid query parameters", error.issues);
    }
    throw ApiErrorHelpers.badRequest("Invalid query parameters");
  }
}

/**
 * Validate route parameters against a Zod schema
 */
export function validateParams<T>(params: Record<string, string>, schema: ZodSchema<T>): T {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiErrorHelpers.badRequest("Invalid route parameters", error.issues);
    }
    throw ApiErrorHelpers.badRequest("Invalid route parameters");
  }
}

/**
 * UUID validation schema factory
 */
export function uuidSchema(field: string = "id") {
  return z.object({
    [field]: z.string().uuid(`Invalid ${field} format`),
  });
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  }),

  // Sort parameters
  sort: z.object({
    sortBy: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),

  // Search
  search: z.object({
    search: z.string().trim().optional(),
  }),
} as const;
