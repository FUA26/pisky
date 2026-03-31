import { describe, it, expect, beforeEach, vi } from "vitest";
import { logAction } from "@/features/admin/audit-logs/service";
import { getAuditLogs, getEntityAuditLogs } from "@/features/admin/audit-logs/api";

// Mock the database
vi.mock("@/config/database", () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
  },
}));

describe("Audit Logging Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("logAction", () => {
    it("should log user creation action", async () => {
      const { db } = await import("@/config/database");

      const mockValues = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: "audit-1",
            userId: "admin-user-id",
            action: "user.created",
            entityType: "user",
            entityId: "new-user-id",
            oldData: null,
            newData: { name: "John Doe", email: "john@example.com" },
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0",
            timestamp: new Date(),
          },
        ]),
      });

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues,
      } as any);

      const result = await logAction({
        userId: "admin-user-id",
        action: "user.created",
        entityType: "user",
        entityId: "new-user-id",
        newData: { name: "John Doe", email: "john@example.com" },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      });

      expect(result).toBeDefined();
      expect(result.action).toBe("user.created");
      expect(result.entityType).toBe("user");
      expect(result.entityId).toBe("new-user-id");
      expect(db.insert).toHaveBeenCalled();
    });

    it("should log user update with old/new data", async () => {
      const { db } = await import("@/config/database");

      const mockValues = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: "audit-2",
            userId: "admin-user-id",
            action: "user.updated",
            entityType: "user",
            entityId: "user-id",
            oldData: { name: "John Doe", email: "john@example.com" },
            newData: { name: "John Smith", email: "john.smith@example.com" },
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0",
            timestamp: new Date(),
          },
        ]),
      });

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues,
      } as any);

      const result = await logAction({
        userId: "admin-user-id",
        action: "user.updated",
        entityType: "user",
        entityId: "user-id",
        oldData: { name: "John Doe", email: "john@example.com" },
        newData: { name: "John Smith", email: "john.smith@example.com" },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      });

      expect(result).toBeDefined();
      expect(result.action).toBe("user.updated");
      expect(result.oldData).toEqual({ name: "John Doe", email: "john@example.com" });
      expect(result.newData).toEqual({ name: "John Smith", email: "john.smith@example.com" });
    });

    it("should handle missing optional fields", async () => {
      const { db } = await import("@/config/database");

      const mockValues = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: "audit-3",
            userId: "admin-user-id",
            action: "system.backup",
            entityType: null,
            entityId: null,
            oldData: null,
            newData: null,
            ipAddress: null,
            userAgent: null,
            timestamp: new Date(),
          },
        ]),
      });

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues,
      } as any);

      const result = await logAction({
        userId: "admin-user-id",
        action: "system.backup",
      });

      expect(result).toBeDefined();
      expect(result.action).toBe("system.backup");
      expect(result.entityType).toBeNull();
      expect(result.entityId).toBeNull();
    });
  });

  describe("getAuditLogs", () => {
    it("should retrieve audit logs with filters", async () => {
      const { db } = await import("@/config/database");

      const mockLogs = [
        {
          id: "audit-1",
          userId: "user-1",
          action: "user.created",
          entityType: "user",
          entityId: "user-2",
          oldData: null,
          newData: { name: "Test User" },
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla",
          timestamp: new Date(),
          user: {
            id: "user-1",
            name: "Admin User",
            email: "admin@example.com",
          },
        },
      ];

      let selectCallCount = 0;
      vi.mocked(db.select).mockImplementation(() => {
        selectCallCount++;
        // First call: count query
        if (selectCallCount === 1) {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([{ count: 1 }]),
            }),
          } as any;
        }
        // Second call: logs query
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    offset: vi.fn().mockResolvedValue(mockLogs),
                  }),
                }),
              }),
            }),
          }),
        } as any;
      });

      const result = await getAuditLogs({
        action: "user.created",
        entityType: "user",
        page: 1,
        pageSize: 10,
      });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].action).toBe("user.created");
      expect(result.total).toBeDefined();
      expect(db.select).toHaveBeenCalled();
    });

    it("should support pagination", async () => {
      const { db } = await import("@/config/database");

      const mockLogs = [
        {
          id: "audit-1",
          userId: "user-1",
          action: "user.created",
          entityType: "user",
          entityId: "user-2",
          oldData: null,
          newData: { name: "Test User" },
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla",
          timestamp: new Date(),
          user: {
            id: "user-1",
            name: "Admin User",
            email: "admin@example.com",
          },
        },
      ];

      let selectCallCount = 0;
      vi.mocked(db.select).mockImplementation(() => {
        selectCallCount++;
        // First call: count query
        if (selectCallCount === 1) {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([{ count: 1 }]),
            }),
          } as any;
        }
        // Second call: logs query
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    offset: vi.fn().mockResolvedValue(mockLogs),
                  }),
                }),
              }),
            }),
          }),
        } as any;
      });

      const result = await getAuditLogs({
        page: 2,
        pageSize: 20,
      });

      expect(result.logs).toBeDefined();
      expect(db.select).toHaveBeenCalled();
    });
  });

  describe("getEntityAuditLogs", () => {
    it("should retrieve audit logs for specific entity", async () => {
      const { db } = await import("@/config/database");

      const mockLogs = [
        {
          id: "audit-1",
          userId: "user-1",
          action: "user.updated",
          entityType: "user",
          entityId: "user-2",
          oldData: { name: "Old Name" },
          newData: { name: "New Name" },
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla",
          timestamp: new Date(),
          user: {
            id: "user-1",
            name: "Admin User",
            email: "admin@example.com",
          },
        },
        {
          id: "audit-2",
          userId: "user-1",
          action: "user.deleted",
          entityType: "user",
          entityId: "user-2",
          oldData: { name: "New Name" },
          newData: null,
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla",
          timestamp: new Date(),
          user: {
            id: "user-1",
            name: "Admin User",
            email: "admin@example.com",
          },
        },
      ];

      const mockQueryBuilder = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockLogs),
      };

      vi.mocked(db.select).mockReturnValue(mockQueryBuilder as any);

      const result = await getEntityAuditLogs("user", "user-2");

      expect(result).toHaveLength(2);
      expect(result[0].entityId).toBe("user-2");
      expect(result[0].entityType).toBe("user");
      expect(result[0].action).toBe("user.updated");
      expect(result[1].action).toBe("user.deleted");
      expect(db.select).toHaveBeenCalled();
    });

    it("should return empty array for entity with no logs", async () => {
      const { db } = await import("@/config/database");

      const mockQueryBuilder = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockQueryBuilder as any);

      const result = await getEntityAuditLogs("user", "non-existent-user");

      expect(result).toEqual([]);
    });
  });
});
