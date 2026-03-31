import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAllPermissionsForRole,
  detectCircularInheritance,
} from "@/features/admin/roles/inheritance";

// Mock the database
vi.mock("@/config/database", () => ({
  db: {
    select: vi.fn(),
  },
}));

describe("Role Inheritance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get direct permissions for role without parent", async () => {
    const { db } = await import("@/config/database");

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
    const { db } = await import("@/config/database");

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
    const { db } = await import("@/config/database");

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
    const { db } = await import("@/config/database");

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
    const { db } = await import("@/config/database");

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
