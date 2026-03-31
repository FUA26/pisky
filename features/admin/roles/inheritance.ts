import { db } from "@/config/database";
import { roles, rolePermissions, permissions } from "@/features/database/models/schema";
import { eq } from "drizzle-orm";
import type { Permission } from "@/features/auth/permissions/rbac-types";

/**
 * Get all permissions for a role including inherited permissions
 * Recursively walks up the role hierarchy
 */
export async function getAllPermissionsForRole(roleId: string): Promise<Permission[]> {
  // Get role details
  const roleResult = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);

  if (!roleResult[0]) {
    return [];
  }

  const role = roleResult[0];

  // Get direct permissions for this role
  const directPerms = await db
    .select({
      name: permissions.name,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, roleId));

  let permissionList: Permission[] = directPerms.map((p) => p.name as Permission);

  // If role has parent, recursively get parent's permissions
  if (role.parentRoleId) {
    const parentPerms = await getAllPermissionsForRole(role.parentRoleId);
    permissionList = [...permissionList, ...parentPerms];
  }

  // Remove duplicates and return
  return Array.from(new Set(permissionList));
}

/**
 * Detect if setting parentRoleId would create circular inheritance
 * @param roleId - The role being updated
 * @param parentRoleId - The proposed parent role ID
 */
export async function detectCircularInheritance(
  roleId: string,
  parentRoleId: string
): Promise<boolean> {
  // Can't be your own parent
  if (roleId === parentRoleId) {
    return true;
  }

  // Walk up the parent chain from parentRoleId
  let currentRoleId = parentRoleId;
  const visited = new Set<string>([roleId, parentRoleId]);

  while (currentRoleId) {
    const parentRoleResult = await db
      .select({ parentRoleId: roles.parentRoleId })
      .from(roles)
      .where(eq(roles.id, currentRoleId))
      .limit(1);

    const parentRole = parentRoleResult[0];

    if (!parentRole?.parentRoleId) {
      // Reached top of hierarchy
      return false;
    }

    // Check if we've seen this role before (cycle detected)
    if (visited.has(parentRole.parentRoleId)) {
      return true;
    }

    visited.add(parentRole.parentRoleId);
    currentRoleId = parentRole.parentRoleId;
  }

  return false;
}

/**
 * Get all descendants of a role (for hierarchy display)
 */
export async function getRoleDescendants(roleId: string): Promise<string[]> {
  const children = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.parentRoleId, roleId));

  const descendants: string[] = [];

  for (const child of children) {
    descendants.push(child.id);
    const childDescendants = await getRoleDescendants(child.id);
    descendants.push(...childDescendants);
  }

  return descendants;
}

/**
 * Get role hierarchy tree for display
 */
export async function getRoleHierarchy(): Promise<RoleHierarchyNode[]> {
  const allRoles = await db.select().from(roles);

  // Build role map
  const roleMap = new Map<string, (typeof allRoles)[0] & { children: RoleHierarchyNode[] }>();
  for (const role of allRoles) {
    roleMap.set(role.id, { ...role, children: [] });
  }

  // Build tree
  const rootRoles: RoleHierarchyNode[] = [];
  for (const role of allRoles) {
    const node = roleMap.get(role.id)!;
    if (role.parentRoleId) {
      const parent = roleMap.get(role.parentRoleId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      rootRoles.push(node);
    }
  }

  return rootRoles;
}

type RoleHierarchyNode = {
  id: string;
  name: string;
  description: string | null;
  parentRoleId: string | null;
  children: RoleHierarchyNode[];
};
