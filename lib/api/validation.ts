import { NextRequest } from "next/server";
import { z } from "zod";
import { ValidationError } from "./error-handler";
import type { ErrorCode } from "../types/api-response";

/**
 * Validation error detail
 */
export interface ValidationErrorDetail {
  path: string[];
  message: string;
  code: ErrorCode;
}

/**
 * Validate request body against a Zod schema
 */
export async function validateBody<T>(request: NextRequest, schema: z.ZodSchema<T>): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}

/**
 * Validate request query parameters against a Zod schema
 */
export function validateQuery<T>(searchParams: URLSearchParams, schema: z.ZodSchema<T>): T {
  const params = Object.fromEntries(searchParams.entries());

  // Convert string values to appropriate types
  const processedParams = Object.keys(params).reduce(
    (acc, key) => {
      const value = params[key];
      // Handle array values (e.g., key=value1&key=value2)
      const allValues = searchParams.getAll(key);

      if (allValues.length > 1) {
        acc[key] = allValues;
      } else {
        acc[key] = value;
      }

      return acc;
    },
    {} as Record<string, unknown>
  );

  try {
    return schema.parse(processedParams);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}

/**
 * Validate route parameters against a Zod schema
 */
export function validateParams<T>(
  params: Record<string, string | string[] | undefined>,
  schema: z.ZodSchema<T>
): T {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}

/**
 * Create a validation middleware for request body
 */
export function withBodyValidation<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<T> => {
    return validateBody(request, schema);
  };
}

/**
 * Create a validation middleware for query parameters
 */
export function withQueryValidation<T>(schema: z.ZodSchema<T>) {
  return (searchParams: URLSearchParams): T => {
    return validateQuery(searchParams, schema);
  };
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),

  // ID
  uuid: z.string().uuid("Invalid UUID format"),

  // Email
  email: z.string().email("Invalid email format"),

  // Password
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number"
    ),

  // Search query
  search: z.string().trim().max(100).optional(),

  // Sort direction
  sortDirection: z.enum(["asc", "desc"]).default("asc" as const),

  // Date range
  dateRange: z.object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }),
};

/**
 * Schema for user creation
 */
export const userCreateSchema = z.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
  name: z.string().trim().min(1).max(100).optional(),
  image: z.string().url().optional(),
});

/**
 * Schema for user update
 */
export const userUpdateSchema = z.object({
  email: commonSchemas.email.optional(),
  name: z.string().trim().min(1).max(100).optional(),
  image: z.string().url().optional(),
});

/**
 * Schema for user list query
 */
export const userListQuerySchema = commonSchemas.pagination.extend({
  search: commonSchemas.search,
  sortBy: z.enum(["name", "email", "createdAt"]).default("createdAt"),
  sortDirection: commonSchemas.sortDirection,
});

/**
 * Type exports
 */
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;
export type PaginationInput = z.infer<typeof commonSchemas.pagination>;
