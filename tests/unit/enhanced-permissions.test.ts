import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  clearPermissionCache,
  clearAllPermissionCache,
  clearPermissionCacheForRole,
} from "@/features/auth/permissions/permissions";
import { ForbiddenError } from "@/lib/api/error-handler";

// Mock the database
vi.mock("@/config/database", () => ({
  getDatabase: vi.fn(() => ({
    select: vi.fn(),
  })),
  db: {
    select: vi.fn(),
  },
}));

// Mock auth
vi.mock("@/config/auth", () => ({
  auth: vi.fn(),
}));

// Mock the inheritance module
vi.mock("@/features/admin/roles/inheritance", () => ({
  getAllPermissionsForRole: vi.fn(),
}));

describe("Enhanced Permission Checking with Inheritance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAllPermissionCache();
  });

  describe("requirePermission", () => {
    it("should allow access when user has inherited permission", async () => {
      const { getAllPermissionsForRole } = await import("@/features/admin/roles/inheritance");
      const { getDatabase } = await import("@/config/database");

      // Mock database query to return user with role
      vi.mocked(getDatabase).mockReturnValue({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    user: { id: "user-1", roleId: "child-role" },
                    role: { id: "child-role", name: "Child Role" },
                  },
                ]),
              }),
            }),
          }),
        }),
      } as any);

      // Mock getAllPermissionsForRole to return inherited permissions
      vi.mocked(getAllPermissionsForRole).mockResolvedValue([
        "USER_READ_ANY",
        "USER_UPDATE_ANY",
        "CONTENT_READ_ANY", // inherited from parent
      ]);

      // Should not throw
      await expect(requirePermission("user-1", "CONTENT_READ_ANY")).resolves.not.toThrow();
    });

    it("should deny access when user lacks permission", async () => {
      const { getAllPermissionsForRole } = await import("@/features/admin/roles/inheritance");
      const { getDatabase } = await import("@/config/database");

      // Mock database query
      vi.mocked(getDatabase).mockReturnValue({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    user: { id: "user-1", roleId: "child-role" },
                    role: { id: "child-role", name: "Child Role" },
                  },
                ]),
              }),
            }),
          }),
        }),
      } as any);

      // Mock permissions without the required one
      vi.mocked(getAllPermissionsForRole).mockResolvedValue(["USER_READ_ANY", "USER_UPDATE_ANY"]);

      // Should throw ForbiddenError
      await expect(requirePermission("user-1", "USER_DELETE_ANY")).rejects.toThrow(ForbiddenError);

      await expect(requirePermission("user-1", "USER_DELETE_ANY")).rejects.toThrow(
        "Missing required permission: USER_DELETE_ANY"
      );
    });

    it("should use cached permissions on subsequent calls", async () => {
      const { getAllPermissionsForRole } = await import("@/features/admin/roles/inheritance");
      const { getDatabase } = await import("@/config/database");

      // Mock database query
      vi.mocked(getDatabase).mockReturnValue({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    user: { id: "user-1", roleId: "role-1" },
                    role: { id: "role-1", name: "Role 1" },
                  },
                ]),
              }),
            }),
          }),
        }),
      } as any);

      vi.mocked(getAllPermissionsForRole).mockResolvedValue(["USER_READ_ANY"]);

      // First call
      await requirePermission("user-1", "USER_READ_ANY");

      // Second call should use cache (getAllPermissionsForRole should only be called once)
      await requirePermission("user-1", "USER_READ_ANY");

      expect(getAllPermissionsForRole).toHaveBeenCalledTimes(1);
    });
  });

  describe("requireAnyPermission", () => {
    it("should allow access when user has at least one permission (OR logic)", async () => {
      const { getAllPermissionsForRole } = await import("@/features/admin/roles/inheritance");
      const { getDatabase } = await import("@/config/database");

      vi.mocked(getDatabase).mockReturnValue({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    user: { id: "user-1", roleId: "role-1" },
                    role: { id: "role-1", name: "Role 1" },
                  },
                ]),
              }),
            }),
          }),
        }),
      } as any);

      // User has only one of the required permissions
      vi.mocked(getAllPermissionsForRole).mockResolvedValue(["USER_READ_ANY", "USER_UPDATE_ANY"]);

      // Should not throw - user has at least one
      await expect(
        requireAnyPermission("user-1", ["USER_READ_ANY", "USER_DELETE_ANY"])
      ).resolves.not.toThrow();
    });

    it("should deny access when user has none of the required permissions", async () => {
      const { getAllPermissionsForRole } = await import("@/features/admin/roles/inheritance");
      const { getDatabase } = await import("@/config/database");

      vi.mocked(getDatabase).mockReturnValue({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    user: { id: "user-1", roleId: "role-1" },
                    role: { id: "role-1", name: "Role 1" },
                  },
                ]),
              }),
            }),
          }),
        }),
      } as any);

      vi.mocked(getAllPermissionsForRole).mockResolvedValue(["CONTENT_READ_ANY"]);

      await expect(
        requireAnyPermission("user-1", ["USER_READ_ANY", "USER_DELETE_ANY"])
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("requireAllPermissions", () => {
    it("should allow access when user has all required permissions (AND logic)", async () => {
      const { getAllPermissionsForRole } = await import("@/features/admin/roles/inheritance");
      const { getDatabase } = await import("@/config/database");

      vi.mocked(getDatabase).mockReturnValue({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    user: { id: "user-1", roleId: "role-1" },
                    role: { id: "role-1", name: "Role 1" },
                  },
                ]),
              }),
            }),
          }),
        }),
      } as any);

      vi.mocked(getAllPermissionsForRole).mockResolvedValue([
        "USER_READ_ANY",
        "USER_UPDATE_ANY",
        "USER_DELETE_ANY",
      ]);

      await expect(
        requireAllPermissions("user-1", ["USER_READ_ANY", "USER_UPDATE_ANY"])
      ).resolves.not.toThrow();
    });

    it("should deny access when user is missing any required permission", async () => {
      const { getAllPermissionsForRole } = await import("@/features/admin/roles/inheritance");
      const { getDatabase } = await import("@/config/database");

      vi.mocked(getDatabase).mockReturnValue({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    user: { id: "user-1", roleId: "role-1" },
                    role: { id: "role-1", name: "Role 1" },
                  },
                ]),
              }),
            }),
          }),
        }),
      } as any);

      // User is missing USER_DELETE_ANY
      vi.mocked(getAllPermissionsForRole).mockResolvedValue(["USER_READ_ANY", "USER_UPDATE_ANY"]);

      await expect(
        requireAllPermissions("user-1", ["USER_READ_ANY", "USER_DELETE_ANY"])
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("Cache Management", () => {
    it("should clear cache for specific user", async () => {
      const { getAllPermissionsForRole } = await import("@/features/admin/roles/inheritance");
      const { getDatabase } = await import("@/config/database");

      vi.mocked(getDatabase).mockReturnValue({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    user: { id: "user-1", roleId: "role-1" },
                    role: { id: "role-1", name: "Role 1" },
                  },
                ]),
              }),
            }),
          }),
        }),
      } as any);

      vi.mocked(getAllPermissionsForRole).mockResolvedValue(["USER_READ_ANY"]);

      // Load permissions
      await requirePermission("user-1", "USER_READ_ANY");

      // Clear cache
      clearPermissionCache("user-1");

      // Load again - should call getAllPermissionsForRole again
      await requirePermission("user-1", "USER_READ_ANY");

      expect(getAllPermissionsForRole).toHaveBeenCalledTimes(2);
    });

    it("should clear cache for all users with a specific role", async () => {
      const { getAllPermissionsForRole } = await import("@/features/admin/roles/inheritance");
      const { getDatabase } = await import("@/config/database");

      let dbCallCount = 0;
      vi.mocked(getDatabase).mockImplementation(() => {
        dbCallCount++;
        // Calls 1, 2, 4, 5: User queries (before and after cache clear)
        // Call 3: Query to find users with role for cache clearing
        if (dbCallCount === 1 || dbCallCount === 2 || dbCallCount === 4 || dbCallCount === 5) {
          return {
            select: vi.fn().mockReturnValue({
              from: vi.fn().mockReturnValue({
                leftJoin: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([
                      {
                        user: {
                          id: dbCallCount === 1 || dbCallCount === 4 ? "user-1" : "user-2",
                          roleId: "role-1",
                        },
                        role: { id: "role-1", name: "Role 1" },
                      },
                    ]),
                  }),
                }),
              }),
            }),
          } as any;
        } else {
          // Call 3: Query to find users with role
          return {
            select: vi.fn().mockReturnValue({
              from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([{ id: "user-1" }, { id: "user-2" }]),
              }),
            }),
          } as any;
        }
      });

      vi.mocked(getAllPermissionsForRole).mockResolvedValue(["USER_READ_ANY"]);

      // Load permissions for both users
      await requirePermission("user-1", "USER_READ_ANY");
      await requirePermission("user-2", "USER_READ_ANY");

      expect(getAllPermissionsForRole).toHaveBeenCalledTimes(2);

      // Clear cache for role
      await clearPermissionCacheForRole("role-1");

      // Load again - should call getAllPermissionsForRole again
      await requirePermission("user-1", "USER_READ_ANY");
      await requirePermission("user-2", "USER_READ_ANY");

      expect(getAllPermissionsForRole).toHaveBeenCalledTimes(4);
    });

    it("should clear entire permission cache", async () => {
      const { getAllPermissionsForRole } = await import("@/features/admin/roles/inheritance");
      const { getDatabase } = await import("@/config/database");

      vi.mocked(getDatabase).mockReturnValue({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    user: { id: "user-1", roleId: "role-1" },
                    role: { id: "role-1", name: "Role 1" },
                  },
                ]),
              }),
            }),
          }),
        }),
      } as any);

      vi.mocked(getAllPermissionsForRole).mockResolvedValue(["USER_READ_ANY"]);

      // Load permissions
      await requirePermission("user-1", "USER_READ_ANY");

      // Clear all cache
      clearAllPermissionCache();

      // Load again - should call getAllPermissionsForRole again
      await requirePermission("user-1", "USER_READ_ANY");

      expect(getAllPermissionsForRole).toHaveBeenCalledTimes(2);
    });
  });

  describe("Inheritance Integration", () => {
    it("should include permissions from parent roles", async () => {
      const { getAllPermissionsForRole } = await import("@/features/admin/roles/inheritance");
      const { getDatabase } = await import("@/config/database");

      vi.mocked(getDatabase).mockReturnValue({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    user: { id: "user-1", roleId: "child-role" },
                    role: { id: "child-role", name: "Child Role" },
                  },
                ]),
              }),
            }),
          }),
        }),
      } as any);

      // Mock inherited permissions (direct + parent + grandparent)
      vi.mocked(getAllPermissionsForRole).mockResolvedValue([
        "CONTENT_DELETE_ANY", // direct
        "CONTENT_UPDATE_ANY", // from parent
        "CONTENT_READ_ANY", // from grandparent
        "USER_READ_ANY", // from grandparent
      ]);

      // Should have access to inherited permissions
      await expect(requirePermission("user-1", "USER_READ_ANY")).resolves.not.toThrow();

      await expect(requirePermission("user-1", "CONTENT_READ_ANY")).resolves.not.toThrow();
    });

    it("should handle multi-level inheritance chains", async () => {
      const { getAllPermissionsForRole } = await import("@/features/admin/roles/inheritance");
      const { getDatabase } = await import("@/config/database");

      vi.mocked(getDatabase).mockReturnValue({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    user: { id: "user-1", roleId: "grandchild-role" },
                    role: { id: "grandchild-role", name: "Grandchild Role" },
                  },
                ]),
              }),
            }),
          }),
        }),
      } as any);

      // Mock multi-level inheritance
      vi.mocked(getAllPermissionsForRole).mockResolvedValue([
        "USER_DELETE_ANY", // grandchild's direct permission
        "USER_UPDATE_ANY", // from child
        "USER_READ_ANY", // from parent
        "CONTENT_READ_ANY", // from parent
      ]);

      // Should have all permissions from the chain
      await expect(
        requireAllPermissions("user-1", ["USER_READ_ANY", "USER_UPDATE_ANY", "USER_DELETE_ANY"])
      ).resolves.not.toThrow();
    });

    it("should handle role with no permissions (empty array)", async () => {
      const { getAllPermissionsForRole } = await import("@/features/admin/roles/inheritance");
      const { getDatabase } = await import("@/config/database");

      vi.mocked(getDatabase).mockReturnValue({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    user: { id: "user-1", roleId: "empty-role" },
                    role: { id: "empty-role", name: "Empty Role" },
                  },
                ]),
              }),
            }),
          }),
        }),
      } as any);

      // Role has no permissions
      vi.mocked(getAllPermissionsForRole).mockResolvedValue([]);

      await expect(requirePermission("user-1", "USER_READ_ANY")).rejects.toThrow(ForbiddenError);
    });
  });
});
