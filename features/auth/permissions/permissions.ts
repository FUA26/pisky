import { auth } from "@/config/auth";
import { hasPermission } from "./rbac-checker";
import { eq } from "drizzle-orm";
import { getDatabase } from "@/config/database";
import { roles, users } from "@/features/database/models/schema";
import type { Permission, UserPermissionsContext, PermissionCheckResult } from "./rbac-types";
import { UnauthorizedError, ForbiddenError } from "@/lib/api/error-handler";
import { getAllPermissionsForRole } from "@/features/admin/roles/inheritance";

// Simple in-memory cache for permissions (5 minute TTL)
const permissionCache = new Map<string, { context: UserPermissionsContext; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Load user permissions from database with caching
 * Uses role inheritance to get all permissions (direct + inherited)
 */
async function loadUserPermissions(userId: string): Promise<UserPermissionsContext> {
  // Check cache first
  const cached = permissionCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.context;
  }

  const db = getDatabase();

  if (!db) {
    throw new Error("Database not available");
  }

  // Get user with role
  const userResult = await db
    .select({
      user: users,
      role: {
        id: roles.id,
        name: roles.name,
      },
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.id, userId))
    .limit(1);

  const userWithRole = userResult[0];

  if (!userWithRole?.user) {
    throw new Error("User not found");
  }

  // Get all permissions for this role (including inherited permissions)
  const permissionList = userWithRole.role
    ? await getAllPermissionsForRole(userWithRole.role.id)
    : [];

  const context: UserPermissionsContext = {
    userId: userWithRole.user.id,
    roleId: userWithRole.user.roleId || "",
    roleName: userWithRole.role?.name || "user",
    permissions: permissionList,
    loadedAt: Date.now(),
  };

  // Cache the result
  permissionCache.set(userId, {
    context,
    expiresAt: Date.now() + CACHE_TTL,
  });

  return context;
}

/**
 * Get the current authenticated session.
 * Returns the session with user attached, or throws if not authenticated.
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    throw new UnauthorizedError("Authentication required");
  }

  return session;
}

/**
 * Check if a user has a specific permission.
 * Throws an error if permission check fails.
 */
export async function requirePermission(userId: string, permission: Permission): Promise<void> {
  const userPermissions = await loadUserPermissions(userId);
  const result = hasPermission(
    userPermissions,
    [permission],
    {}
  ) as unknown as PermissionCheckResult;

  if (!result.allowed) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }
}

/**
 * Check if a user has ANY of the specified permissions.
 * Throws an error only if NONE of the permissions are granted.
 */
export async function requireAnyPermission(
  userId: string,
  permissions: Permission[]
): Promise<void> {
  const userPermissions = await loadUserPermissions(userId);
  const result = hasPermission(userPermissions, permissions, {
    strict: false,
  }) as unknown as PermissionCheckResult;

  if (!result.allowed) {
    throw new ForbiddenError(`Missing one of required permissions: ${permissions.join(", ")}`);
  }
}

/**
 * Check if a user has ALL of the specified permissions.
 * Throws an error if ANY permission is missing.
 */
export async function requireAllPermissions(
  userId: string,
  permissions: Permission[]
): Promise<void> {
  const userPermissions = await loadUserPermissions(userId);
  const result = hasPermission(userPermissions, permissions, {
    strict: true,
  }) as unknown as PermissionCheckResult;

  if (!result.allowed) {
    throw new ForbiddenError(`Missing required permissions: ${permissions.join(", ")}`);
  }
}

/**
 * Clear permission cache for a specific user
 */
export function clearPermissionCache(userId: string): void {
  permissionCache.delete(userId);
}

/**
 * Clear entire permission cache
 */
export function clearAllPermissionCache(): void {
  permissionCache.clear();
}

/**
 * Clear permission cache for all users with a specific role
 * This should be called when role permissions change
 * @param roleId - The role ID whose users' caches should be cleared
 */
export async function clearPermissionCacheForRole(roleId: string): Promise<void> {
  const db = getDatabase();

  if (!db) {
    throw new Error("Database not available");
  }

  // Find all users with this role
  const usersWithRole = await db
    .select({
      id: users.id,
    })
    .from(users)
    .where(eq(users.roleId, roleId));

  // Clear cache for each user
  for (const user of usersWithRole) {
    permissionCache.delete(user.id);
  }
}
