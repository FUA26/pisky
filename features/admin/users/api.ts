import { getDatabase } from "@/config/database";
import { users, roles } from "@/features/database/models/schema";
import { eq, like, or, desc, sql, asc, inArray, and } from "drizzle-orm";
import type { User, Role } from "@/features/database/models/schema";
import {
  CreateUserInput,
  UpdateUserInput,
  UserQueryInput,
  BulkDeleteInput,
  BulkAssignRoleInput,
} from "./validations";

/**
 * User with role information
 */
export type UserWithRole = User & { role?: Role };

/**
 * Paginated users result
 */
export interface PaginatedUsersResult {
  users: UserWithRole[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Get list of users with pagination, search, and filtering
 */
export async function getUsers(params: UserQueryInput): Promise<PaginatedUsersResult> {
  const db = getDatabase();
  if (!db) throw new Error("Database not available");

  const { page = 1, limit = 20, search, roleId, sortBy = "createdAt", order = "desc" } = params;
  const offset = (page - 1) * limit;

  // Build conditions
  const conditions: any[] = [];

  if (search) {
    conditions.push(or(like(users.email, `%${search}%`), like(users.name, `%${search}%`)));
  }

  if (roleId) {
    conditions.push(eq(users.roleId, roleId));
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const countQuery = db.select({ count: sql<number>`count(*)` }).from(users);
  if (whereCondition) {
    countQuery.where(whereCondition);
  }
  const [{ count }] = await countQuery;

  // Get paginated results with sorting
  const orderByColumn =
    sortBy === "name"
      ? users.name
      : sortBy === "email"
        ? users.email
        : sortBy === "updatedAt"
          ? users.updatedAt
          : users.createdAt;
  const orderByDirection = order === "asc" ? asc : desc;

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      image: users.image,
      passwordHash: users.passwordHash,
      roleId: users.roleId,
      passwordResetToken: users.passwordResetToken,
      passwordResetExpires: users.passwordResetExpires,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      role: {
        id: roles.id,
        name: roles.name,
        description: roles.description,
        parentRoleId: roles.parentRoleId,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
      },
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(whereCondition)
    .orderBy(orderByDirection(orderByColumn))
    .limit(limit)
    .offset(offset);

  // Transform result to match UserWithRole type
  const usersWithRole: UserWithRole[] = result.map((row: any) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.emailVerified,
    image: row.image,
    passwordHash: row.passwordHash,
    roleId: row.roleId,
    passwordResetToken: row.passwordResetToken,
    passwordResetExpires: row.passwordResetExpires,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    role: row.role?.id
      ? {
          id: row.role.id,
          name: row.role.name,
          description: row.role.description,
          parentRoleId: row.role.parentRoleId,
          createdAt: row.role.createdAt,
          updatedAt: row.role.updatedAt,
        }
      : undefined,
  }));

  return {
    users: usersWithRole,
    total: Number(count),
    page,
    limit,
    hasMore: page * limit < Number(count),
  };
}

/**
 * Get a single user by ID
 */
export async function getUserById(id: string): Promise<UserWithRole | null> {
  const db = getDatabase();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      image: users.image,
      passwordHash: users.passwordHash,
      roleId: users.roleId,
      passwordResetToken: users.passwordResetToken,
      passwordResetExpires: users.passwordResetExpires,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      role: {
        id: roles.id,
        name: roles.name,
        description: roles.description,
        parentRoleId: roles.parentRoleId,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
      },
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.id, id))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const row = result[0] as any;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.emailVerified,
    image: row.image,
    passwordHash: row.passwordHash,
    roleId: row.roleId,
    passwordResetToken: row.passwordResetToken,
    passwordResetExpires: row.passwordResetExpires,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    role: row.role?.id
      ? {
          id: row.role.id,
          name: row.role.name,
          description: row.role.description,
          parentRoleId: row.role.parentRoleId,
          createdAt: row.role.createdAt,
          updatedAt: row.role.updatedAt,
        }
      : undefined,
  };
}

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput, createdBy: string): Promise<User> {
  const db = getDatabase();
  if (!db) throw new Error("Database not available");

  // Check if email already exists
  const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);

  if (existing.length > 0) {
    throw new Error("User with this email already exists");
  }

  // Validate role exists if provided
  if (input.roleId) {
    const role = await db.select().from(roles).where(eq(roles.id, input.roleId)).limit(1);
    if (role.length === 0) {
      throw new Error("Role not found");
    }
  }

  // Hash password if provided
  let passwordHash: string | undefined;
  if (input.password) {
    const bcrypt = await import("bcrypt");
    passwordHash = await bcrypt.hash(input.password, 10);
  }

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      email: input.email,
      name: input.name,
      passwordHash,
      roleId: input.roleId,
      image: input.image,
    } as any)
    .returning();

  return newUser;
}

/**
 * Update a user
 */
export async function updateUser(
  id: string,
  input: UpdateUserInput,
  updatedBy: string
): Promise<User> {
  const db = getDatabase();
  if (!db) throw new Error("Database not available");

  // Get existing user
  const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (existing.length === 0) {
    throw new Error("User not found");
  }

  const user = existing[0];

  // Check if email is being changed and if it conflicts
  if (input.email && input.email !== user.email) {
    const emailConflict = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (emailConflict.length > 0) {
      throw new Error("Email already in use");
    }
  }

  // Validate role exists if provided
  if (input.roleId) {
    const role = await db.select().from(roles).where(eq(roles.id, input.roleId)).limit(1);
    if (role.length === 0) {
      throw new Error("Role not found");
    }
  }

  // Hash password if provided
  let passwordHash: string | undefined;
  if (input.password) {
    const bcrypt = await import("bcrypt");
    passwordHash = await bcrypt.hash(input.password, 10);
  }

  // Build update object
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (input.email) updateData.email = input.email;
  if (input.name) updateData.name = input.name;
  if (input.password) updateData.passwordHash = passwordHash;
  if (input.roleId !== undefined) updateData.roleId = input.roleId;
  if (input.image !== undefined) updateData.image = input.image;

  // Update user
  const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();

  return updatedUser;
}

/**
 * Delete a user
 */
export async function deleteUser(id: string, deletedBy: string): Promise<User> {
  const db = getDatabase();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (existing.length === 0) {
    throw new Error("User not found");
  }

  const [deletedUser] = await db.delete(users).where(eq(users.id, id)).returning();
  return deletedUser;
}

/**
 * Bulk delete users
 */
export async function bulkDeleteUsers(
  input: BulkDeleteInput,
  deletedBy: string
): Promise<{ count: number; users: User[] }> {
  const db = getDatabase();
  if (!db) throw new Error("Database not available");

  // Get users before deletion for audit
  const usersToDelete = await db.select().from(users).where(inArray(users.id, input.userIds));

  if (usersToDelete.length === 0) {
    throw new Error("No users found");
  }

  // Delete users
  const result = await db.delete(users).where(inArray(users.id, input.userIds)).returning();

  return {
    count: result.length,
    users: result,
  };
}

/**
 * Bulk assign role to users
 */
export async function bulkAssignRole(
  input: BulkAssignRoleInput,
  updatedBy: string
): Promise<{ count: number; users: User[] }> {
  const db = getDatabase();
  if (!db) throw new Error("Database not available");

  // Validate role exists
  const role = await db.select().from(roles).where(eq(roles.id, input.roleId)).limit(1);
  if (role.length === 0) {
    throw new Error("Role not found");
  }

  // Update users
  const result = await db
    .update(users)
    .set({ roleId: input.roleId, updatedAt: new Date() })
    .where(inArray(users.id, input.userIds))
    .returning();

  return {
    count: result.length,
    users: result,
  };
}
