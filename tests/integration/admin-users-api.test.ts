import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from "vitest";
import type { NextRequest } from "next/server";
import { getDatabase } from "@/config/database";
import {
  users,
  roles,
  rolePermissions,
  permissions,
  auditLogs,
} from "@/features/database/models/schema";
import { eq, inArray } from "drizzle-orm";
import { POST as createUser, GET as getUsers } from "@/app/api/admin/users/route";
import {
  GET as getUser,
  PUT as updateUser,
  DELETE as deleteUser,
} from "@/app/api/admin/users/[id]/route";
import { POST as bulkOperation } from "@/app/api/admin/users/bulk/route";
import { logAction } from "@/features/admin/audit-logs/service";
import {
  clearPermissionCache,
  clearAllPermissionCache,
} from "@/features/auth/permissions/permissions";
import { hash } from "bcrypt";
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

describe("Admin Users API", () => {
  let adminRole: any;
  let userRole: any;
  let adminUser: any;
  let regularUser: any;
  let testPermission: any;

  beforeAll(async () => {
    const db = getDatabase()!;

    // Create test permissions
    const [adminPerm] = await db
      .insert(permissions)
      .values({
        name: "ADMIN_USERS_MANAGE",
        category: "admin",
        description: "Manage users",
      })
      .returning();
    testPermission = adminPerm;

    // Create roles
    const [adminRoleData] = await db
      .insert(roles)
      .values({
        name: "Admin",
        description: "Administrator role",
      })
      .returning();
    adminRole = adminRoleData;

    const [userRoleData] = await db
      .insert(roles)
      .values({
        name: "User",
        description: "Regular user role",
      })
      .returning();
    userRole = userRoleData;

    // Assign permission to admin role
    await db.insert(rolePermissions).values({
      roleId: adminRole.id,
      permissionId: testPermission.id,
    });

    // Create admin user
    const passwordHash = await hash("admin123", 10);
    const [adminUserData] = await db
      .insert(users)
      .values({
        email: "admin@test.com",
        name: "Admin User",
        passwordHash,
        roleId: adminRole.id,
      })
      .returning();
    adminUser = adminUserData;

    // Create regular user
    const userPasswordHash = await hash("user123", 10);
    const [regularUserData] = await db
      .insert(users)
      .values({
        email: "user@test.com",
        name: "Regular User",
        passwordHash: userPasswordHash,
        roleId: userRole.id,
      })
      .returning();
    regularUser = regularUserData;

    // Clear permission cache
    clearAllPermissionCache();
  });

  afterAll(async () => {
    const db = getDatabase()!;

    // Cleanup test data
    await db.delete(auditLogs);
    await db.delete(rolePermissions);
    await db.delete(users);
    await db.delete(roles);
    await db.delete(permissions);
  });

  beforeEach(async () => {
    const db = getDatabase()!;

    // Clear audit logs before each test
    await db.delete(auditLogs);
    clearPermissionCache(adminUser.id);
    clearPermissionCache(regularUser.id);
  });

  describe("GET /api/admin/users", () => {
    it("should list users with pagination", async () => {
      const request = createMockRequest(
        "GET",
        "http://localhost:3000/api/admin/users?page=1&limit=10"
      );

      // Mock auth
      vi.spyOn(require("@/features/auth/permissions/permissions"), "requireAuth").mockResolvedValue(
        createMockSession(adminUser.id)
      );
      vi.spyOn(
        require("@/features/auth/permissions/permissions"),
        "requirePermission"
      ).mockResolvedValue(undefined);

      const response = await getUsers(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.meta).toBeDefined();
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(10);
    });

    it("should filter users by search term", async () => {
      const request = createMockRequest(
        "GET",
        "http://localhost:3000/api/admin/users?search=admin"
      );

      vi.spyOn(require("@/features/auth/permissions/permissions"), "requireAuth").mockResolvedValue(
        createMockSession(adminUser.id)
      );
      vi.spyOn(
        require("@/features/auth/permissions/permissions"),
        "requirePermission"
      ).mockResolvedValue(undefined);

      const response = await getUsers(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.some((u: any) => u.email.includes("admin"))).toBe(true);
    });

    it("should filter users by role", async () => {
      const request = createMockRequest(
        "GET",
        `http://localhost:3000/api/admin/users?roleId=${userRole.id}`
      );

      vi.spyOn(require("@/features/auth/permissions/permissions"), "requireAuth").mockResolvedValue(
        createMockSession(adminUser.id)
      );
      vi.spyOn(
        require("@/features/auth/permissions/permissions"),
        "requirePermission"
      ).mockResolvedValue(undefined);

      const response = await getUsers(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.every((u: any) => u.roleId === userRole.id)).toBe(true);
    });
  });

  describe("POST /api/admin/users", () => {
    it("should create a new user", async () => {
      const newUserData = {
        email: "newuser@test.com",
        name: "New User",
        password: "password123",
        roleId: userRole.id,
      };

      const request = createMockRequest(
        "POST",
        "http://localhost:3000/api/admin/users",
        newUserData
      );

      vi.spyOn(require("@/features/auth/permissions/permissions"), "requireAuth").mockResolvedValue(
        createMockSession(adminUser.id)
      );
      vi.spyOn(
        require("@/features/auth/permissions/permissions"),
        "requirePermission"
      ).mockResolvedValue(undefined);

      const response = await createUser(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe(newUserData.email);
      expect(data.data.name).toBe(newUserData.name);

      // Verify audit log was created
      const db = getDatabase()!;
      const [auditLog] = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.action, "USER_CREATE"));
      expect(auditLog).toBeDefined();
      expect(auditLog.entityId).toBe(data.data.id);

      // Cleanup
      await db.delete(users).where(eq(users.id, data.data.id));
    });

    it("should reject duplicate email", async () => {
      const duplicateData = {
        email: "admin@test.com", // Already exists
        name: "Duplicate User",
      };

      const request = createMockRequest(
        "POST",
        "http://localhost:3000/api/admin/users",
        duplicateData
      );

      vi.spyOn(require("@/features/auth/permissions/permissions"), "requireAuth").mockResolvedValue(
        createMockSession(adminUser.id)
      );
      vi.spyOn(
        require("@/features/auth/permissions/permissions"),
        "requirePermission"
      ).mockResolvedValue(undefined);

      const response = await createUser(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe("GET /api/admin/users/:id", () => {
    it("should get a single user", async () => {
      const request = createMockRequest(
        "GET",
        `http://localhost:3000/api/admin/users/${regularUser.id}`
      );

      vi.spyOn(require("@/features/auth/permissions/permissions"), "requireAuth").mockResolvedValue(
        createMockSession(adminUser.id)
      );
      vi.spyOn(
        require("@/features/auth/permissions/permissions"),
        "requirePermission"
      ).mockResolvedValue(undefined);

      const response = await getUser(request, { params: { id: regularUser.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(regularUser.id);
    });

    it("should return 404 for non-existent user", async () => {
      const fakeId = uuidv4();
      const request = createMockRequest("GET", `http://localhost:3000/api/admin/users/${fakeId}`);

      vi.spyOn(require("@/features/auth/permissions/permissions"), "requireAuth").mockResolvedValue(
        createMockSession(adminUser.id)
      );
      vi.spyOn(
        require("@/features/auth/permissions/permissions"),
        "requirePermission"
      ).mockResolvedValue(undefined);

      const response = await getUser(request, { params: { id: fakeId } });

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/admin/users/:id", () => {
    it("should update a user", async () => {
      const updateData = {
        name: "Updated Name",
      };

      const request = createMockRequest(
        "PUT",
        `http://localhost:3000/api/admin/users/${regularUser.id}`,
        updateData
      );

      vi.spyOn(require("@/features/auth/permissions/permissions"), "requireAuth").mockResolvedValue(
        createMockSession(adminUser.id)
      );
      vi.spyOn(
        require("@/features/auth/permissions/permissions"),
        "requirePermission"
      ).mockResolvedValue(undefined);

      const response = await updateUser(request, { params: { id: regularUser.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe(updateData.name);

      // Verify audit log
      const db = getDatabase()!;
      const [auditLog] = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.action, "USER_UPDATE"));
      expect(auditLog).toBeDefined();

      // Reset
      await db.update(users).set({ name: "Regular User" }).where(eq(users.id, regularUser.id));
    });

    it("should prevent self-modification", async () => {
      const request = createMockRequest(
        "PUT",
        `http://localhost:3000/api/admin/users/${adminUser.id}`,
        { name: "Hacked" }
      );

      vi.spyOn(require("@/features/auth/permissions/permissions"), "requireAuth").mockResolvedValue(
        createMockSession(adminUser.id)
      );
      vi.spyOn(
        require("@/features/auth/permissions/permissions"),
        "requirePermission"
      ).mockResolvedValue(undefined);

      const response = await updateUser(request, { params: { id: adminUser.id } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });

    it("should clear permission cache when role changes", async () => {
      const updateData = {
        roleId: adminRole.id,
      };

      const request = createMockRequest(
        "PUT",
        `http://localhost:3000/api/admin/users/${regularUser.id}`,
        updateData
      );

      vi.spyOn(require("@/features/auth/permissions/permissions"), "requireAuth").mockResolvedValue(
        createMockSession(adminUser.id)
      );
      vi.spyOn(
        require("@/features/auth/permissions/permissions"),
        "requirePermission"
      ).mockResolvedValue(undefined);

      const cacheClearSpy = vi.spyOn(
        require("@/features/auth/permissions/permissions"),
        "clearPermissionCache"
      );

      await updateUser(request, { params: { id: regularUser.id } });

      expect(cacheClearSpy).toHaveBeenCalledWith(regularUser.id);

      // Reset
      const db = getDatabase()!;
      await db.update(users).set({ roleId: userRole.id }).where(eq(users.id, regularUser.id));
    });
  });

  describe("DELETE /api/admin/users/:id", () => {
    it("should delete a user", async () => {
      const db = getDatabase()!;

      // Create a test user to delete
      const passwordHash = await hash("test123", 10);
      const [testUser] = await db
        .insert(users)
        .values({
          email: "todelete@test.com",
          name: "To Delete",
          passwordHash,
        })
        .returning();

      const request = createMockRequest(
        "DELETE",
        `http://localhost:3000/api/admin/users/${testUser.id}`
      );

      vi.spyOn(require("@/features/auth/permissions/permissions"), "requireAuth").mockResolvedValue(
        createMockSession(adminUser.id)
      );
      vi.spyOn(
        require("@/features/auth/permissions/permissions"),
        "requirePermission"
      ).mockResolvedValue(undefined);

      const response = await deleteUser(request, { params: { id: testUser.id } });

      expect(response.status).toBe(204);

      // Verify user is deleted
      const [deletedUser] = await db.select().from(users).where(eq(users.id, testUser.id));
      expect(deletedUser).toBeUndefined();

      // Verify audit log
      const [auditLog] = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.action, "USER_DELETE"));
      expect(auditLog).toBeDefined();
      expect(auditLog.entityId).toBe(testUser.id);
    });

    it("should prevent self-deletion", async () => {
      const request = createMockRequest(
        "DELETE",
        `http://localhost:3000/api/admin/users/${adminUser.id}`
      );

      vi.spyOn(require("@/features/auth/permissions/permissions"), "requireAuth").mockResolvedValue(
        createMockSession(adminUser.id)
      );
      vi.spyOn(
        require("@/features/auth/permissions/permissions"),
        "requirePermission"
      ).mockResolvedValue(undefined);

      const response = await deleteUser(request, { params: { id: adminUser.id } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });
  });

  describe("POST /api/admin/users/bulk", () => {
    let testUsers: any[] = [];

    beforeEach(async () => {
      const db = getDatabase()!;

      // Create test users for bulk operations
      const passwordHash = await hash("test123", 10);
      const [user1, user2, user3] = await db
        .insert(users)
        .values([
          { email: "bulk1@test.com", name: "Bulk User 1", passwordHash, roleId: userRole.id },
          { email: "bulk2@test.com", name: "Bulk User 2", passwordHash, roleId: userRole.id },
          { email: "bulk3@test.com", name: "Bulk User 3", passwordHash, roleId: userRole.id },
        ])
        .returning();
      testUsers = [user1, user2, user3];
    });

    afterEach(async () => {
      const db = getDatabase()!;

      // Cleanup test users
      await db.delete(users).where(
        inArray(
          users.id,
          testUsers.map((u) => u.id)
        )
      );
      testUsers = [];
    });

    it("should bulk delete users", async () => {
      const request = createMockRequest("POST", "http://localhost:3000/api/admin/users/bulk", {
        operation: "delete",
        userIds: [testUsers[0].id, testUsers[1].id],
      });

      vi.spyOn(require("@/features/auth/permissions/permissions"), "requireAuth").mockResolvedValue(
        createMockSession(adminUser.id)
      );
      vi.spyOn(
        require("@/features/auth/permissions/permissions"),
        "requirePermission"
      ).mockResolvedValue(undefined);

      const response = await bulkOperation(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.count).toBe(2);

      // Verify users are deleted
      const db = getDatabase()!;
      const remaining = await db.select().from(users).where(eq(users.id, testUsers[0].id));
      expect(remaining.length).toBe(0);
    });

    it("should bulk assign role", async () => {
      const request = createMockRequest("POST", "http://localhost:3000/api/admin/users/bulk", {
        operation: "assignRole",
        userIds: [testUsers[0].id, testUsers[1].id],
        roleId: adminRole.id,
      });

      vi.spyOn(require("@/features/auth/permissions/permissions"), "requireAuth").mockResolvedValue(
        createMockSession(adminUser.id)
      );
      vi.spyOn(
        require("@/features/auth/permissions/permissions"),
        "requirePermission"
      ).mockResolvedValue(undefined);

      const cacheClearSpy = vi.spyOn(
        require("@/features/auth/permissions/permissions"),
        "clearPermissionCache"
      );

      const response = await bulkOperation(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.count).toBe(2);
      expect(cacheClearSpy).toHaveBeenCalledTimes(2);

      // Verify roles were updated
      const db = getDatabase()!;
      const [user1] = await db.select().from(users).where(eq(users.id, testUsers[0].id));
      expect(user1.roleId).toBe(adminRole.id);

      // Reset
      await db
        .update(users)
        .set({ roleId: userRole.id })
        .where(inArray(users.id, [testUsers[0].id, testUsers[1].id]));
    });

    it("should prevent self-deletion in bulk delete", async () => {
      const request = createMockRequest("POST", "http://localhost:3000/api/admin/users/bulk", {
        operation: "delete",
        userIds: [testUsers[0].id, adminUser.id],
      });

      vi.spyOn(require("@/features/auth/permissions/permissions"), "requireAuth").mockResolvedValue(
        createMockSession(adminUser.id)
      );
      vi.spyOn(
        require("@/features/auth/permissions/permissions"),
        "requirePermission"
      ).mockResolvedValue(undefined);

      const response = await bulkOperation(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });
  });
});
