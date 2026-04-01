/**
 * Audit Logging Module
 *
 * Provides comprehensive audit trail functionality for tracking administrative actions.
 * Supports logging, querying, and filtering of audit events.
 */

// Service functions
export {
  logAction,
  logActionFromRequest,
  extractIpAddress,
  extractUserAgent,
  type AuditLogParams,
} from "./service";

// API functions
export {
  getAuditLogs,
  getEntityAuditLogs,
  getUserAuditLogs,
  type AuditLogFilters,
  type AuditLogResult,
} from "./api";
