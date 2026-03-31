import type {
  Permission,
  PermissionCheckOptions,
  PermissionCheckResult,
  UserPermissionsContext,
} from "./rbac-types";

/**
 * Permission pairs for OWN vs ANY relationships
 * Used for automatic permission escalation (e.g., if you have ANY, you also have OWN)
 */
const OWN_ANY_PAIRS: Record<string, string> = {
  USER_READ_OWN: "USER_READ_ANY",
  USER_UPDATE_OWN: "USER_UPDATE_ANY",
  USER_DELETE_OWN: "USER_DELETE_ANY",
  CONTENT_READ_OWN: "CONTENT_READ_ANY",
  CONTENT_UPDATE_OWN: "CONTENT_UPDATE_ANY",
  CONTENT_DELETE_OWN: "CONTENT_DELETE_ANY",
  FILE_READ_OWN: "FILE_READ_ANY",
  FILE_UPLOAD_OWN: "FILE_UPLOAD_ANY",
  FILE_DELETE_OWN: "FILE_DELETE_ANY",
};

/**
 * Check if a user has the required permissions
 */
export function hasPermission(
  context: UserPermissionsContext | null | undefined,
  requiredPermissions: Permission[],
  options?: PermissionCheckOptions
): boolean;

export function hasPermission(
  context: UserPermissionsContext | null | undefined,
  requiredPermissions: Permission[],
  options?: PermissionCheckOptions
): PermissionCheckResult;

export function hasPermission(
  context: UserPermissionsContext | null | undefined,
  requiredPermissions: Permission[],
  options: PermissionCheckOptions = {}
): boolean | PermissionCheckResult {
  const { currentUserId, resourceOwnerId, strict = false } = options;

  // Handle missing context
  if (!context || !context.permissions) {
    return _makeResult(false, undefined, "No permission context provided");
  }

  const { permissions } = context;

  // If no permissions required, grant access
  if (requiredPermissions.length === 0) {
    return _makeResult(true, undefined, "No permissions required");
  }

  // Normalize permissions: ANY implies OWN for resource checks
  const normalizedPermissions = _normalizePermissions(permissions);

  // Check each required permission
  const results = requiredPermissions.map((requiredPerm) => {
    // Direct permission check
    if (normalizedPermissions.has(requiredPerm)) {
      return { allowed: true, grantedBy: requiredPerm };
    }

    // Resource-level check for OWN permissions
    if (requiredPerm.endsWith("_OWN") && currentUserId && resourceOwnerId) {
      const anyPermission = OWN_ANY_PAIRS[requiredPerm];

      // If user has ANY permission, they can access any resource
      if (anyPermission && normalizedPermissions.has(anyPermission as Permission)) {
        return { allowed: true, grantedBy: anyPermission as Permission };
      }

      // If user owns the resource, grant access with OWN permission
      // Note: We already checked for direct permission above, so this handles
      // the case where user doesn't have the permission but owns the resource
      if (currentUserId === resourceOwnerId) {
        return { allowed: true, grantedBy: requiredPerm };
      }
    }

    return { allowed: false, grantedBy: undefined };
  });

  // Apply strict (AND) vs non-strict (OR) logic
  if (strict) {
    const allAllowed = results.every((r) => r.allowed);
    const grantedBy = allAllowed ? requiredPermissions[0] : undefined;
    const reason = allAllowed ? undefined : "Missing one or more required permissions";

    return _makeResult(allAllowed, grantedBy, reason);
  } else {
    const anyAllowed = results.some((r) => r.allowed);
    const firstGranted = results.find((r) => r.allowed)?.grantedBy;
    const reason = anyAllowed ? undefined : "Missing required permissions";

    return _makeResult(anyAllowed, firstGranted, reason);
  }
}

/**
 * Normalize permissions by adding implied permissions
 */
function _normalizePermissions(permissions: Permission[]): Set<Permission> {
  const normalized = new Set(permissions);

  // Add implied OWN permissions for ANY permissions
  for (const [own, anyPerm] of Object.entries(OWN_ANY_PAIRS)) {
    if (normalized.has(anyPerm as Permission)) {
      normalized.add(own as Permission);
    }
  }

  return normalized;
}

/**
 * Make result object (handles both boolean and detailed result)
 */
function _makeResult(
  allowed: boolean,
  grantedBy?: Permission,
  reason?: string
): PermissionCheckResult {
  return {
    allowed,
    grantedBy,
    reason,
  };
}

/**
 * Type guard to check if value is a valid UserPermissionsContext
 */
export function isUserPermissionsContext(value: unknown): value is UserPermissionsContext {
  if (!value || typeof value !== "object") return false;

  const ctx = value as Record<string, unknown>;
  return (
    typeof ctx.userId === "string" &&
    typeof ctx.roleId === "string" &&
    typeof ctx.roleName === "string" &&
    Array.isArray(ctx.permissions) &&
    typeof ctx.loadedAt === "number"
  );
}
