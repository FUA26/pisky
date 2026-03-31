/**
 * All available permissions in the system
 * This type supports both predefined permissions and dynamic/custom permissions
 */
export type Permission =
  // User Management
  | "USER_READ_OWN"
  | "USER_READ_ANY"
  | "USER_UPDATE_OWN"
  | "USER_UPDATE_ANY"
  | "USER_DELETE_OWN"
  | "USER_DELETE_ANY"
  | "USER_CREATE"
  // Content Management
  | "CONTENT_READ_OWN"
  | "CONTENT_READ_ANY"
  | "CONTENT_CREATE"
  | "CONTENT_UPDATE_OWN"
  | "CONTENT_UPDATE_ANY"
  | "CONTENT_DELETE_OWN"
  | "CONTENT_DELETE_ANY"
  | "CONTENT_PUBLISH"
  | "CONTENT_ARCHIVE"
  // File Management
  | "FILE_UPLOAD_OWN"
  | "FILE_UPLOAD_ANY"
  | "FILE_READ_OWN"
  | "FILE_READ_ANY"
  | "FILE_DELETE_OWN"
  | "FILE_DELETE_ANY"
  | "FILE_MANAGE_ORPHANS"
  | "FILE_ADMIN"
  // Settings
  | "SETTINGS_READ"
  | "SETTINGS_UPDATE"
  // Analytics
  | "ANALYTICS_VIEW"
  | "ANALYTICS_EXPORT"
  // Admin
  | "ADMIN_PANEL_ACCESS"
  | "ADMIN_USERS_MANAGE"
  | "ADMIN_ROLES_MANAGE"
  | "ADMIN_PERMISSIONS_MANAGE"
  | "ADMIN_SYSTEM_SETTINGS_MANAGE"
  // Allow dynamic/custom permissions
  | string;

/**
 * Context containing user's permissions and role information
 */
export interface UserPermissionsContext {
  /** User ID */
  userId: string;
  /** Role ID */
  roleId: string;
  /** Role name */
  roleName: string;
  /** List of permissions assigned to the user's role */
  permissions: Permission[];
  /** Timestamp when permissions were loaded */
  loadedAt: number;
}

/**
 * Options for resource-level permission checks
 */
export interface PermissionCheckOptions {
  /** ID of the currently authenticated user */
  currentUserId?: string;
  /** ID of the resource owner (for OWN vs ANY checks) */
  resourceOwnerId?: string;
  /** If true, ALL permissions must be present (AND logic). Default: false (OR logic) */
  strict?: boolean;
}

/**
 * Result of a permission check
 */
export interface PermissionCheckResult {
  /** Whether the permission check passed */
  allowed: boolean;
  /** The specific permission that granted access (if any) */
  grantedBy?: Permission;
  /** Reason for denial (useful for debugging/UI feedback) */
  reason?: string;
}

/**
 * Database permission record interface
 */
export interface PermissionRecord {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  createdAt: Date;
}

/**
 * Role with permissions
 */
export interface RoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  permissions: Array<{
    permission: {
      name: string;
    };
  }>;
}
