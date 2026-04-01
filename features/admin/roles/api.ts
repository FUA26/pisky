import { getDatabase } from "@/config/database";
import { roles, rolePermissions, users, permissions } from "@/features/database/models/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { detectCircularInheritance } from "./inheritance";
import type { CreateRoleInput, UpdateRoleInput } from "./validations";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/features/database/models/schema";

export interface RoleListFilters {
  page?: number;
  limit?: number;
}

export interface RoleListResult {
  roles: Array<
    typeof roles.$inferSelect & {
      parentName?: string;
      permissionCount?: number;
      userCount?: number;
    }
  >;
  total: number;
  page: number;
  limit: number;
}

/**
 * List roles with stats
 */
export async function listRoles(filters: RoleListFilters = {}): Promise<RoleListResult> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  // Get total count
  const db = getDatabase()!;
  const countResult = await db.select({ count: count() }).from(roles);

  const total = countResult[0]?.count || 0;

  // Get roles with related data
  const rolesList = await (db as unknown as PostgresJsDatabase<typeof schema>).query.roles.findMany(
    {
      with: {
        parentRole: {
          columns: { name: true },
        },
      },
      limit,
      offset,
      orderBy: [desc(roles.createdAt)],
    }
  );

  // Get permission and user counts for each role
  const rolesWithStats = await Promise.all(
    rolesList.map(async (role) => {
      const permCount = await db
        .select({ count: count() })
        .from(rolePermissions)
        .where(eq(rolePermissions.roleId, role.id));

      const userCount = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.roleId, role.id));

      return {
        ...role,
        permissionCount: permCount[0]?.count || 0,
        userCount: userCount[0]?.count || 0,
      };
    })
  );

  return {
    roles: rolesWithStats,
    total,
    page,
    limit,
  };
}

/**
 * Get role by ID with permissions
 */
export async function getRoleById(id: string) {
  const db = getDatabase()!;
  const role = await (db as unknown as PostgresJsDatabase<typeof schema>).query.roles.findFirst({
    where: eq(roles.id, id),
    with: {
      parentRole: {
        columns: { id: true, name: true },
      },
      rolePermissions: {
        with: {
          permission: true,
        },
      },
    },
  });

  if (!role) return null;

  return {
    ...role,
    permissionIds: (role as any).rolePermissions.map((rp: any) => rp.permission.id),
  };
}

/**
 * Create new role
 */
export async function createRole(input: CreateRoleInput) {
  const db = getDatabase()!;

  // Check for circular inheritance if parentRoleId is set
  if (input.parentRoleId) {
    // For new roles, we use a temporary ID for circular detection
    // The detectCircularInheritance function handles this
    const isCircular = await detectCircularInheritance("new", input.parentRoleId);
    if (isCircular) {
      throw new Error("Circular role inheritance detected");
    }
  }

  const newRole = await db
    .insert(roles)
    .values({
      name: input.name,
      description: input.description,
      parentRoleId: input.parentRoleId,
    })
    .returning();

  // Assign permissions
  if (input.permissionIds.length > 0) {
    await db.insert(rolePermissions).values(
      input.permissionIds.map((permissionId) => ({
        roleId: (newRole as any)[0].id,
        permissionId,
      }))
    );
  }

  return getRoleById((newRole as any)[0].id);
}

/**
 * Update role
 */
export async function updateRole(id: string, input: UpdateRoleInput) {
  const db = getDatabase()!;
  const existingRole = await getRoleById(id);
  if (!existingRole) {
    throw new Error("Role not found");
  }

  // Check for circular inheritance if parentRoleId is changing
  if (
    input.parentRoleId !== undefined &&
    input.parentRoleId !== (existingRole as any).parentRoleId
  ) {
    const isCircular = await detectCircularInheritance(id, input.parentRoleId || "");
    if (isCircular) {
      throw new Error("Circular role inheritance detected");
    }
  }

  // Update role
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.parentRoleId !== undefined) updateData.parentRoleId = input.parentRoleId;
  updateData.updatedAt = new Date();

  await db.update(roles).set(updateData).where(eq(roles.id, id));

  // Update permissions if provided
  if (input.permissionIds !== undefined) {
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));

    if (input.permissionIds.length > 0) {
      await db.insert(rolePermissions).values(
        input.permissionIds.map((permissionId) => ({
          roleId: id,
          permissionId,
        }))
      );
    }
  }

  return getRoleById(id);
}

/**
 * Delete role
 */
export async function deleteRole(id: string) {
  const db = getDatabase()!;

  // Check if role has users
  const usersWithRole = await db.select({ count: count() }).from(users).where(eq(users.roleId, id));

  if ((usersWithRole[0]?.count || 0) > 0) {
    throw new Error("Cannot delete role with assigned users");
  }

  const deletedRole = await db.delete(roles).where(eq(roles.id, id)).returning();

  return (deletedRole as any)[0];
}

/**
 * Get users with a specific role
 */
export async function getRoleUsers(roleId: string) {
  const db = getDatabase()!;

  const roleUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.roleId, roleId))
    .orderBy(desc(users.createdAt));

  return roleUsers;
}
