import { z } from "zod";

/**
 * Schema for creating a new user
 */
export const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  roleId: z.string().uuid("Invalid role ID").optional(),
  image: z.string().url("Invalid image URL").optional(),
});

/**
 * Schema for updating a user
 */
export const updateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  roleId: z.string().uuid("Invalid role ID").optional(),
  image: z.string().url("Invalid image URL").optional().nullable(),
});

/**
 * Schema for user query parameters with filtering
 */
export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  search: z.string().trim().optional(),
  roleId: z.string().uuid("Invalid role ID").optional(),
  sortBy: z.enum(["name", "email", "createdAt", "updatedAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Schema for bulk delete operation
 */
export const bulkDeleteSchema = z.object({
  userIds: z.array(z.string().uuid("Invalid user ID")).min(1, "At least one user ID required"),
});

/**
 * Schema for bulk role assignment
 */
export const bulkAssignRoleSchema = z.object({
  userIds: z.array(z.string().uuid("Invalid user ID")).min(1, "At least one user ID required"),
  roleId: z.string().uuid("Invalid role ID"),
});

/**
 * Schema for validating user ID in route params
 */
export const userIdParamsSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;
export type BulkAssignRoleInput = z.infer<typeof bulkAssignRoleSchema>;
