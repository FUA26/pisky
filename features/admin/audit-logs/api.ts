import { getDatabase } from "@/config/database";
import { auditLogs, users } from "@/features/database/models/schema";
import { eq, and, desc, like, sql, gte, lte, or } from "drizzle-orm";
import type { AuditLog } from "@/features/database/models/schema";

/**
 * Filters for querying audit logs
 */
export interface AuditLogFilters {
  /** Filter by action type (e.g., 'user.created') */
  action?: string;
  /** Filter by entity type (e.g., 'user', 'role') */
  entityType?: string;
  /** Filter by specific entity ID */
  entityId?: string;
  /** Filter by user who performed the action */
  userId?: string;
  /** Search in action, entity type */
  search?: string;
  /** Filter by date range start */
  startDate?: Date;
  /** Filter by date range end */
  endDate?: Date;
  /** Page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
}

/**
 * Result of audit log query with pagination
 */
export interface AuditLogResult {
  /** Array of audit logs with user info */
  logs: Array<
    AuditLog & {
      user: {
        id: string;
        name: string | null;
        email: string;
      };
    }
  >;
  /** Total count of logs matching filters */
  total: number;
  /** Current page number */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * Get audit logs with optional filters and pagination
 *
 * @param filters - Query filters and pagination options
 * @returns Paginated audit logs with user information
 */
export async function getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogResult> {
  const db = getDatabase();

  const {
    action,
    entityType,
    entityId,
    userId,
    search,
    startDate,
    endDate,
    page = 1,
    pageSize = 50,
  } = filters;

  // Build conditions
  const conditions = [];

  if (action) {
    conditions.push(eq(auditLogs.action, action));
  }

  if (entityType) {
    conditions.push(eq(auditLogs.entityType, entityType));
  }

  if (entityId) {
    conditions.push(eq(auditLogs.entityId, entityId));
  }

  if (userId) {
    conditions.push(eq(auditLogs.userId, userId));
  }

  if (search) {
    conditions.push(
      or(like(auditLogs.action, `%${search}%`), like(auditLogs.entityType, `%${search}%`))
    );
  }

  if (startDate) {
    conditions.push(gte(auditLogs.timestamp, startDate));
  }

  if (endDate) {
    conditions.push(lte(auditLogs.timestamp, endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [{ count }] = await db!
    .select({ count: sql<number>`count(*)::int` })
    .from(auditLogs)
    .where(whereClause);

  const total = Number(count);
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;

  // Get paginated logs with user info
  const logs = await db!
    .select({
      id: auditLogs.id,
      userId: auditLogs.userId,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      oldData: auditLogs.oldData,
      newData: auditLogs.newData,
      ipAddress: auditLogs.ipAddress,
      userAgent: auditLogs.userAgent,
      timestamp: auditLogs.timestamp,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(auditLogs)
    .innerJoin(users, eq(auditLogs.userId, users.id))
    .where(whereClause)
    .orderBy(desc(auditLogs.timestamp))
    .limit(pageSize)
    .offset(offset);

  return {
    logs: logs as any,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Get all audit logs for a specific entity
 * Useful for showing the history of changes to a user, role, etc.
 *
 * @param entityType - Type of entity (e.g., 'user', 'role')
 * @param entityId - ID of the entity
 * @returns Array of audit logs for the entity (most recent first)
 */
export async function getEntityAuditLogs(
  entityType: string,
  entityId: string
): Promise<
  Array<
    AuditLog & {
      user: {
        id: string;
        name: string | null;
        email: string;
      };
    }
  >
> {
  const db = getDatabase()!;

  const logs = await db
    .select({
      id: auditLogs.id,
      userId: auditLogs.userId,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      oldData: auditLogs.oldData,
      newData: auditLogs.newData,
      ipAddress: auditLogs.ipAddress,
      userAgent: auditLogs.userAgent,
      timestamp: auditLogs.timestamp,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(auditLogs)
    .innerJoin(users, eq(auditLogs.userId, users.id))
    .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
    .orderBy(desc(auditLogs.timestamp));

  return logs as any;
}

/**
 * Get audit logs for a specific user (actions performed by the user)
 *
 * @param userId - ID of the user
 * @param page - Page number (default: 1)
 * @param pageSize - Number of items per page (default: 50)
 * @returns Paginated audit logs performed by the user
 */
export async function getUserAuditLogs(
  userId: string,
  page = 1,
  pageSize = 50
): Promise<AuditLogResult> {
  return getAuditLogs({
    userId,
    page,
    pageSize,
  });
}
