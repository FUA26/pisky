import { db } from "@/config/database";
import { auditLogs } from "@/features/database/models/schema";
import type { NewAuditLog, AuditLog } from "@/features/database/models/schema";
import type { NextRequest } from "next/server";

/**
 * Parameters for logging an audit action
 */
export interface AuditLogParams {
  userId: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  oldData?: Record<string, any> | null;
  newData?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Log an administrative action to the audit trail
 *
 * @param params - Audit log parameters
 * @returns The created audit log entry
 */
export async function logAction(params: AuditLogParams): Promise<AuditLog> {
  const [log] = await db
    .insert(auditLogs)
    .values({
      userId: params.userId,
      action: params.action,
      entityType: params.entityType ?? null,
      entityId: params.entityId ?? null,
      oldData: params.oldData ?? null,
      newData: params.newData ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    } as NewAuditLog)
    .returning();

  return log;
}

/**
 * Extract IP address from Next.js request
 *
 * @param request - Next.js request object
 * @returns IP address or null
 */
export function extractIpAddress(request: NextRequest): string | null {
  // Check x-forwarded-for header (for proxied requests)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  // Check x-real-ip header
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fall back to the direct connection IP
  // Note: In Next.js, we don't have direct access to the socket,
  // so this returns null. You may need to use middleware or custom headers.
  return null;
}

/**
 * Extract user agent from Next.js request
 *
 * @param request - Next.js request object
 * @returns User agent string or null
 */
export function extractUserAgent(request: NextRequest): string | null {
  return request.headers.get("user-agent");
}

/**
 * Helper to log an action from a Next.js request
 * Automatically extracts IP and user agent from the request
 *
 * @param request - Next.js request object
 * @param params - Audit log parameters (userId, action, etc.)
 * @returns The created audit log entry
 */
export async function logActionFromRequest(
  request: NextRequest,
  params: Omit<AuditLogParams, "ipAddress" | "userAgent">
): Promise<AuditLog> {
  return logAction({
    ...params,
    ipAddress: extractIpAddress(request),
    userAgent: extractUserAgent(request),
  });
}
