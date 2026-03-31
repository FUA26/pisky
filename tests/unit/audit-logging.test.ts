import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  logAction,
  extractIpAddress,
  extractUserAgent,
  logActionFromRequest,
} from "@/features/admin/audit-logs/service";
import {
  getAuditLogs,
  getEntityAuditLogs,
  getUserAuditLogs,
} from "@/features/admin/audit-logs/api";
import type { NextRequest } from "next/server";

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

  describe("extractIpAddress", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const mockRequest = {
        headers: {
          get: vi.fn((header) => {
            if (header === "x-forwarded-for") return "192.168.1.1, 10.0.0.1";
            return null;
          }),
        },
      } as unknown as NextRequest;

      const ip = extractIpAddress(mockRequest);
      expect(ip).toBe("192.168.1.1");
    });

    it("should fallback to x-real-ip header", () => {
      const mockRequest = {
        headers: {
          get: vi.fn((header) => {
            if (header === "x-real-ip") return "10.0.0.1";
            return null;
          }),
        },
      } as unknown as NextRequest;

      const ip = extractIpAddress(mockRequest);
      expect(ip).toBe("10.0.0.1");
    });

    it("should return null when no IP headers present", () => {
      const mockRequest = {
        headers: {
          get: vi.fn(() => null),
        },
      } as unknown as NextRequest;

      const ip = extractIpAddress(mockRequest);
      expect(ip).toBeNull();
    });
  });

  describe("extractUserAgent", () => {
    it("should extract user agent from request", () => {
      const mockRequest = {
        headers: {
          get: vi.fn((header) => {
            if (header === "user-agent") return "Mozilla/5.0";
            return null;
          }),
        },
      } as unknown as NextRequest;

      const userAgent = extractUserAgent(mockRequest);
      expect(userAgent).toBe("Mozilla/5.0");
    });

    it("should return null when no user agent present", () => {
      const mockRequest = {
        headers: {
          get: vi.fn(() => null),
        },
      } as unknown as NextRequest;

      const userAgent = extractUserAgent(mockRequest);
      expect(userAgent).toBeNull();
    });
  });

  describe("logActionFromRequest", () => {
    it("should extract IP and user agent from request", async () => {
      const { db } = await import("@/config/database");

      const mockRequest = {
        headers: {
          get: vi.fn((header) => {
            const headers: Record<string, string> = {
              "x-forwarded-for": "192.168.1.1",
              "user-agent": "TestAgent/1.0",
            };
            return headers[header] || null;
          }),
        },
      } as unknown as NextRequest;

      const mockValues = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: "audit-1",
            userId: "user-1",
            action: "test.action",
            entityType: null,
            entityId: null,
            oldData: null,
            newData: null,
            ipAddress: "192.168.1.1",
            userAgent: "TestAgent/1.0",
            timestamp: new Date(),
          },
        ]),
      });

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues,
      } as any);

      await logActionFromRequest(mockRequest, {
        userId: "user-1",
        action: "test.action",
      });

      expect(db.insert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: "192.168.1.1",
          userAgent: "TestAgent/1.0",
        })
      );
    });
  });

  describe("getUserAuditLogs", () => {
    it("should return logs for specific user", async () => {
      const { db } = await import("@/config/database");

      const mockLogs = [
        {
          id: "log-1",
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
        {
          id: "log-2",
          userId: "user-1",
          action: "user.updated",
          entityType: "user",
          entityId: "user-2",
          oldData: { name: "Test User" },
          newData: { name: "Updated User" },
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
              where: vi.fn().mockResolvedValue([{ count: 2 }]),
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

      const logs = await getUserAuditLogs("user-1");
      expect(logs.logs).toHaveLength(2);
      expect(logs.logs[0].action).toBe("user.created");
      expect(logs.total).toBe(2);
    });

    it("should return empty array when no logs found", async () => {
      const { db } = await import("@/config/database");

      let selectCallCount = 0;
      vi.mocked(db.select).mockImplementation(() => {
        selectCallCount++;
        // First call: count query
        if (selectCallCount === 1) {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([{ count: 0 }]),
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
                    offset: vi.fn().mockResolvedValue([]),
                  }),
                }),
              }),
            }),
          }),
        } as any;
      });

      const logs = await getUserAuditLogs("non-existent-user");
      expect(logs.logs).toEqual([]);
      expect(logs.total).toBe(0);
    });
  });
});
