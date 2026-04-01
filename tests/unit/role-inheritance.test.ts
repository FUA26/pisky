import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAllPermissionsForRole,
  detectCircularInheritance,
  getRoleDescendants,
  getRoleHierarchy,
} from "@/features/admin/roles/inheritance";
import { getDatabase } from "@/config/database";

// Mock the database
const mockDb = {
  select: vi.fn(),
  execute: vi.fn(),
};

vi.mock("@/config/database", () => ({
  getDatabase: vi.fn(() => mockDb),
}));

describe("Role Inheritance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get direct permissions for role without parent", async () => {
    const db = getDatabase()!;

    // Mock role query
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([
              { id: "role-without-parent", name: "Basic User", parentRoleId: null },
            ]),
        }),
      }),
    } as any);

    // Mock permissions query
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ name: "users:read" }, { name: "content:read" }]),
        }),
      }),
    } as any);

    const permissions = await getAllPermissionsForRole("role-without-parent");
    expect(permissions).toContain("users:read");
    expect(permissions).toContain("content:read");
  });

  it("should inherit permissions from parent role", async () => {
    const db = getDatabase()!;

    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      // First call: get child role
      if (callCount === 1) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi
                .fn()
                .mockResolvedValue([
                  { id: "child-role-id", name: "Child Role", parentRoleId: "parent-role-id" },
                ]),
            }),
          }),
        } as any;
      }
      // Second call: get child permissions
      if (callCount === 2) {
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([{ name: "content:edit" }]),
            }),
          }),
        } as any;
      }
      // Third call: get parent role
      if (callCount === 3) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi
                .fn()
                .mockResolvedValue([
                  { id: "parent-role-id", name: "Parent Role", parentRoleId: null },
                ]),
            }),
          }),
        } as any;
      }
      // Fourth call: get parent permissions
      if (callCount === 4) {
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([{ name: "users:read" }]),
            }),
          }),
        } as any;
      }
      return {} as any;
    });

    const permissions = await getAllPermissionsForRole("child-role-id");
    expect(permissions).toContain("users:read"); // from parent
    expect(permissions).toContain("content:edit"); // direct
  });

  it("should handle multi-level inheritance", async () => {
    const db = getDatabase()!;

    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      // Grandchild role
      if (callCount === 1) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi
                .fn()
                .mockResolvedValue([
                  { id: "grandchild-role-id", name: "Grandchild", parentRoleId: "child-role-id" },
                ]),
            }),
          }),
        } as any;
      }
      // Grandchild permissions
      if (callCount === 2) {
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([{ name: "content:delete" }]),
            }),
          }),
        } as any;
      }
      // Child role
      if (callCount === 3) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi
                .fn()
                .mockResolvedValue([
                  { id: "child-role-id", name: "Child", parentRoleId: "parent-role-id" },
                ]),
            }),
          }),
        } as any;
      }
      // Child permissions
      if (callCount === 4) {
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([{ name: "content:edit" }]),
            }),
          }),
        } as any;
      }
      // Parent role
      if (callCount === 5) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi
                .fn()
                .mockResolvedValue([{ id: "parent-role-id", name: "Parent", parentRoleId: null }]),
            }),
          }),
        } as any;
      }
      // Parent permissions
      if (callCount === 6) {
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([{ name: "users:read" }]),
            }),
          }),
        } as any;
      }
      return {} as any;
    });

    const permissions = await getAllPermissionsForRole("grandchild-role-id");
    expect(permissions).toContain("users:read"); // from grandparent
    expect(permissions).toContain("content:edit"); // from parent
    expect(permissions).toContain("content:delete"); // direct
  });

  it("should detect circular inheritance (self-reference)", async () => {
    const result = await detectCircularInheritance("role-a", "role-a");
    expect(result).toBe(true);
  });

  it("should detect circular inheritance (chain)", async () => {
    const db = getDatabase()!;

    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      // role-b -> role-a
      if (callCount === 1) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ parentRoleId: "role-a" }]),
            }),
          }),
        } as any;
      }
      // role-a -> role-b (circular!)
      if (callCount === 2) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ parentRoleId: "role-b" }]),
            }),
          }),
        } as any;
      }
      return {} as any;
    });

    const result = await detectCircularInheritance("role-a", "role-b");
    expect(result).toBe(true);
  });

  it("should allow valid inheritance chain", async () => {
    const db = getDatabase()!;

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            { parentRoleId: null }, // parent has no parent
          ]),
        }),
      }),
    } as any);

    const result = await detectCircularInheritance("role-child", "role-parent");
    expect(result).toBe(false);
  });
});

describe("getAllPermissionsForRole", () => {
  it("should handle cycles in role hierarchy", async () => {
    const db = getDatabase()!;

    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      // First role
      if (callCount === 1) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi
                .fn()
                .mockResolvedValue([{ id: "role-a", name: "Role A", parentRoleId: "role-b" }]),
            }),
          }),
        } as any;
      }
      // Permissions for role-a
      if (callCount === 2) {
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([{ name: "content:edit" }]),
            }),
          }),
        } as any;
      }
      // Second role (role-b)
      if (callCount === 3) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi
                .fn()
                .mockResolvedValue([{ id: "role-b", name: "Role B", parentRoleId: "role-a" }]),
            }),
          }),
        } as any;
      }
      // Permissions for role-b
      if (callCount === 4) {
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([{ name: "users:read" }]),
            }),
          }),
        } as any;
      }
      // Back to role-a (cycle detected!)
      if (callCount === 5) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi
                .fn()
                .mockResolvedValue([{ id: "role-a", name: "Role A", parentRoleId: "role-b" }]),
            }),
          }),
        } as any;
      }
      return {} as any;
    });

    const permissions = await getAllPermissionsForRole("role-a");
    // Should return permissions from both roles before cycle is detected
    expect(permissions).toContain("content:edit");
    expect(permissions).toContain("users:read");
  });
});

describe("getRoleDescendants", () => {
  it("should return empty array for leaf nodes", async () => {
    const db = getDatabase()!;

    (db.execute as any).mockResolvedValue({
      rows: [],
    });

    const descendants = await getRoleDescendants("leaf-role");
    expect(descendants).toEqual([]);
  });

  it("should return all descendants in hierarchy", async () => {
    const db = getDatabase()!;

    (db.execute as any).mockResolvedValue({
      rows: [{ id: "child-1" }, { id: "child-2" }, { id: "grandchild-1" }, { id: "grandchild-2" }],
    });

    const descendants = await getRoleDescendants("parent-role");
    expect(descendants).toEqual(["child-1", "child-2", "grandchild-1", "grandchild-2"]);
  });

  it("should handle empty result set", async () => {
    const db = getDatabase()!;

    (db.execute as any).mockResolvedValue({
      rows: [],
    });

    const descendants = await getRoleDescendants("non-existent-role");
    expect(descendants).toEqual([]);
  });
});

describe("getRoleHierarchy", () => {
  it("should build tree structure correctly", async () => {
    const db = getDatabase()!;

    const mockRoles = [
      { id: "root", name: "Root", description: null, parentRoleId: null },
      { id: "child", name: "Child", description: null, parentRoleId: "root" },
      { id: "grandchild", name: "Grandchild", description: null, parentRoleId: "child" },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockResolvedValue(mockRoles),
    } as any);

    const hierarchy = await getRoleHierarchy();
    expect(hierarchy).toHaveLength(1);
    expect(hierarchy[0].id).toBe("root");
    expect(hierarchy[0].children).toHaveLength(1);
    expect(hierarchy[0].children[0].id).toBe("child");
    expect(hierarchy[0].children[0].children).toHaveLength(1);
    expect(hierarchy[0].children[0].children[0].id).toBe("grandchild");
  });

  it("should handle multiple root roles", async () => {
    const db = getDatabase()!;

    const mockRoles = [
      { id: "root-1", name: "Root 1", description: null, parentRoleId: null },
      { id: "root-2", name: "Root 2", description: null, parentRoleId: null },
      { id: "child-1", name: "Child 1", description: null, parentRoleId: "root-1" },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockResolvedValue(mockRoles),
    } as any);

    const hierarchy = await getRoleHierarchy();
    expect(hierarchy).toHaveLength(2);
    expect(hierarchy[0].id).toBe("root-1");
    expect(hierarchy[1].id).toBe("root-2");
    expect(hierarchy[0].children).toHaveLength(1);
    expect(hierarchy[0].children[0].id).toBe("child-1");
  });

  it("should handle empty hierarchy", async () => {
    const db = getDatabase()!;

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockResolvedValue([]),
    } as any);

    const hierarchy = await getRoleHierarchy();
    expect(hierarchy).toEqual([]);
  });
});
