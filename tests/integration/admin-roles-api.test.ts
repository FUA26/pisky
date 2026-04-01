import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import type { NextRequest } from "next/server";
import { getDatabase } from "@/config/database";
import {
  roles,
  rolePermissions,
  permissions,
  users,
  auditLogs,
} from "@/features/database/models/schema";
import { eq, inArray } from "drizzle-orm";
import { POST as createRole, GET as getRoles } from "@/app/api/admin/roles/route";
import {
  GET as getRole,
  PATCH as updateRole,
  DELETE as deleteRole,
} from "@/app/api/admin/roles/[id]/route";
import { logAction } from "@/features/admin/audit-logs/service";
import {
  clearPermissionCache,
  clearAllPermissionCache,
} from "@/features/auth/permissions/permissions";
import { v4 as uuidv4 } from "uuid";

// Helper to create a mock request
function createMockRequest(method: string, url: string, body?: any, userId?: string): NextRequest {
  const headers = new Headers();
  headers.set("content-type", "application/json");
  if (userId) {
    headers.set("x-test-user-id", userId);
  }

  return new Request(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }) as unknown as NextRequest;
}

// Helper to create mock session
function createMockSession(userId: string) {
  return {
    user: { id: userId, email: "admin@test.com", name: "Admin" },
    expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  };
}

describe("Admin Roles API", () => {
  let adminRole: any;
  let userRole: any;
  let adminUser: any;
  let testPermission: any;

  beforeAll(async () => {
    const db = getDatabase()!;
    // Create test permissions
    const [rolesReadPerm] = await db
      .insert(permissions)
      .values({
        name: "roles:read",
        category: "roles",
        description: "Read roles",
      })
      .returning();

    const [rolesManagePerm] = await db
      .insert(permissions)
      .values({
        name: "roles:manage",
        category: "roles",
        description: "Manage roles",
      })
      .returning();
    testPermission = rolesManagePerm;

    // Create admin role
    const [adminRoleData] = await db
      .insert(roles)
      .values({
        name: "Admin",
        description: "Administrator role",
      })
      .returning();
    adminRole = adminRoleData;

    // Create user role
    const [userRoleData] = await db
      .insert(roles)
      .values({
        name: "User",
        description: "Regular user role",
      })
      .returning();
    userRole = userRoleData;

    // Assign permissions to admin role
    await db.insert(rolePermissions).values([
      {
        roleId: adminRole.id,
        permissionId: rolesReadPerm.id,
      },
      {
        roleId: adminRole.id,
        permissionId: rolesManagePerm.id,
      },
    ]);

    // Create admin user
    const [adminUserData] = await db
      .insert(users)
      .values({
        email: "admin@test.com",
        name: "Admin User",
        roleId: adminRole.id,
      })
      .returning();
    adminUser = adminUserData;
  });

  afterAll(async () => {
    const db = getDatabase()!;
    // Cleanup
    await clearAllPermissionCache();
    await db.delete(rolePermissions);
    await db.delete(auditLogs);
    await db.delete(users);
    await db.delete(roles);
    await db.delete(permissions);
  });

  beforeEach(async () => {
    // Clear permission cache before each test
    await clearAllPermissionCache();
  });

  describe("GET /api/admin/roles", () => {
    it("should list roles with pagination", async () => {
      const request = createMockRequest(
        "GET",
        "http://localhost:3000/api/admin/roles?page=1&limit=10",
        undefined,
        adminUser.id
      );

      const response = await getRoles(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.roles).toBeDefined();
      expect(data.total).toBeGreaterThanOrEqual(2);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(10);
    });

    it("should include role stats", async () => {
      const request = createMockRequest(
        "GET",
        "http://localhost:3000/api/admin/roles",
        undefined,
        adminUser.id
      );

      const response = await getRoles(request);
      const data = await response.json();

      expect(data.roles[0]).toHaveProperty("permissionCount");
      expect(data.roles[0]).toHaveProperty("userCount");
    });
  });

  describe("POST /api/admin/roles", () => {
    it("should create a new role", async () => {
      const newRoleData = {
        name: "Editor",
        description: "Can edit content",
        permissionIds: [],
      };

      const request = createMockRequest(
        "POST",
        "http://localhost:3000/api/admin/roles",
        newRoleData,
        adminUser.id
      );

      const response = await createRole(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("Editor");
      expect(data.description).toBe("Can edit content");
    });

    it("should create role with parent", async () => {
      const newRoleData = {
        name: "Moderator",
        description: "Content moderator",
        parentRoleId: adminRole.id,
        permissionIds: [],
      };

      const request = createMockRequest(
        "POST",
        "http://localhost:3000/api/admin/roles",
        newRoleData,
        adminUser.id
      );

      const response = await createRole(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.parentRoleId).toBe(adminRole.id);
    });

    it("should create role with permissions", async () => {
      const newRoleData = {
        name: "Manager",
        description: "Team manager",
        permissionIds: [testPermission.id],
      };

      const request = createMockRequest(
        "POST",
        "http://localhost:3000/api/admin/roles",
        newRoleData,
        adminUser.id
      );

      const response = await createRole(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.permissionIds).toContain(testPermission.id);
    });

    it("should reject duplicate role names", async () => {
      const newRoleData = {
        name: "Admin", // Already exists
        description: "Duplicate",
        permissionIds: [],
      };

      const request = createMockRequest(
        "POST",
        "http://localhost:3000/api/admin/roles",
        newRoleData,
        adminUser.id
      );

      const response = await createRole(request);
      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/admin/roles/[id]", () => {
    it("should get role by id", async () => {
      const request = createMockRequest(
        "GET",
        `http://localhost:3000/api/admin/roles/${adminRole.id}`,
        undefined,
        adminUser.id
      );

      const response = await getRole(request, { params: Promise.resolve({ id: adminRole.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(adminRole.id);
      expect(data.name).toBe("Admin");
      expect(data.permissionIds).toBeDefined();
    });

    it("should return 404 for non-existent role", async () => {
      const fakeId = uuidv4();
      const request = createMockRequest(
        "GET",
        `http://localhost:3000/api/admin/roles/${fakeId}`,
        undefined,
        adminUser.id
      );

      const response = await getRole(request, { params: Promise.resolve({ id: fakeId }) });
      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /api/admin/roles/[id]", () => {
    it("should update role name", async () => {
      const updateData = {
        name: "Super Admin",
      };

      const request = createMockRequest(
        "PATCH",
        `http://localhost:3000/api/admin/roles/${adminRole.id}`,
        updateData,
        adminUser.id
      );

      const response = await updateRole(request, { params: Promise.resolve({ id: adminRole.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe("Super Admin");
    });

    it("should update role parent", async () => {
      const db = getDatabase()!;

      const [newRole] = await db
        .insert(roles)
        .values({
          name: "Child Role",
          description: "Test child role",
        })
        .returning();

      const updateData = {
        parentRoleId: userRole.id,
      };

      const request = createMockRequest(
        "PATCH",
        `http://localhost:3000/api/admin/roles/${newRole.id}`,
        updateData,
        adminUser.id
      );

      const response = await updateRole(request, { params: Promise.resolve({ id: newRole.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.parentRoleId).toBe(userRole.id);
    });

    it("should update role permissions", async () => {
      const db = getDatabase()!;

      const [newRole] = await db
        .insert(roles)
        .values({
          name: "Test Role",
          description: "Test role for permission update",
        })
        .returning();

      const updateData = {
        permissionIds: [testPermission.id],
      };

      const request = createMockRequest(
        "PATCH",
        `http://localhost:3000/api/admin/roles/${newRole.id}`,
        updateData,
        adminUser.id
      );

      const response = await updateRole(request, { params: Promise.resolve({ id: newRole.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.permissionIds).toContain(testPermission.id);
    });

    it("should reject circular inheritance", async () => {
      const db = getDatabase()!;

      // Create parent -> child relationship
      const [parentRole] = await db
        .insert(roles)
        .values({
          name: "Parent",
          description: "Parent role",
        })
        .returning();

      const [childRole] = await db
        .insert(roles)
        .values({
          name: "Child",
          description: "Child role",
          parentRoleId: parentRole.id,
        })
        .returning();

      // Try to make parent a child of child (circular)
      const updateData = {
        parentRoleId: childRole.id,
      };

      const request = createMockRequest(
        "PATCH",
        `http://localhost:3000/api/admin/roles/${parentRole.id}`,
        updateData,
        adminUser.id
      );

      const response = await updateRole(request, {
        params: Promise.resolve({ id: parentRole.id }),
      });
      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/admin/roles/[id]", () => {
    it("should delete role", async () => {
      const db = getDatabase()!;
      const [newRole] = await db
        .insert(roles)
        .values({
          name: "Temporary Role",
          description: "Role to be deleted",
        })
        .returning();

      const request = createMockRequest(
        "DELETE",
        `http://localhost:3000/api/admin/roles/${newRole.id}`,
        undefined,
        adminUser.id
      );

      const response = await deleteRole(request, { params: Promise.resolve({ id: newRole.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(newRole.id);

      // Verify deletion
      const deleted = await (db as any).query.roles.findFirst({
        where: eq(roles.id, newRole.id),
      });
      expect(deleted).toBeUndefined();
    });

    it("should not delete role with assigned users", async () => {
      // adminRole has adminUser assigned to it
      const request = createMockRequest(
        "DELETE",
        `http://localhost:3000/api/admin/roles/${adminRole.id}`,
        undefined,
        adminUser.id
      );

      const response = await deleteRole(request, { params: Promise.resolve({ id: adminRole.id }) });
      expect(response.status).toBe(400);
    });
  });
});
