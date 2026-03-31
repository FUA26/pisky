import { auth } from "@/config/auth";
import { hasPermission } from "./rbac-checker";
import { eq } from "drizzle-orm";
import { getDatabase } from "@/config/database";
import { roles, permissions, rolePermissions, users } from "@/features/database/models/schema";
import type { Permission, UserPermissionsContext } from "./rbac-types";

// Simple in-memory cache for permissions (5 minute TTL)
const permissionCache = new Map<string, { context: UserPermissionsContext; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Load user permissions from database with caching
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

  // Get permissions for this role
  const rolePerms = userWithRole.role
    ? await db
        .select({
          permission: {
            name: permissions.name,
          },
        })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, userWithRole.role.id))
    : [];

  const permissionList = rolePerms.map((rp) => rp.permission.name) as Permission[];

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
    throw new Error("Unauthorized: Authentication required");
  }

  return session;
}

/**
 * Check if a user has a specific permission.
 * Throws an error if permission check fails.
 */
export async function requirePermission(userId: string, permission: Permission): Promise<void> {
  const userPermissions = await loadUserPermissions(userId);
  const allowed = hasPermission(userPermissions, [permission]);

  if (!allowed) {
    throw new Error(`Forbidden: Missing required permission: ${permission}`);
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
  const allowed = hasPermission(userPermissions, permissions, { strict: false });

  if (!allowed) {
    throw new Error(`Forbidden: Missing one of required permissions: ${permissions.join(", ")}`);
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
  const allowed = hasPermission(userPermissions, permissions, { strict: true });

  if (!allowed) {
    throw new Error(`Forbidden: Missing required permissions: ${permissions.join(", ")}`);
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
