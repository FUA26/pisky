"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { hasPermission } from "./rbac-checker";
import type { Permission, UserPermissionsContext } from "./rbac-types";

/**
 * Hook to get current session with loading state
 */
export function useAuth() {
  const { data: session, status } = useSession();

  return {
    session,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isUnauthenticated: status === "unauthenticated",
  };
}

/**
 * Hook to check if user has a specific permission
 */
export function useCan(
  permission: Permission,
  options?: {
    currentUserId?: string;
    resourceOwnerId?: string;
  }
): boolean {
  const { data: session } = useSession();

  return useMemo(() => {
    if (!session?.user) {
      return false;
    }

    const context: UserPermissionsContext | null = session.user.permissions
      ? {
          userId: session.user.id,
          roleId: session.user.roleId || "",
          roleName: session.user.role?.name || "user",
          permissions: session.user.permissions,
          loadedAt: Date.now(),
        }
      : null;

    return hasPermission(context, [permission], options) as boolean;
  }, [session, permission, options]);
}

/**
 * Hook to check if user has ANY of the specified permissions (OR logic)
 */
export function useCanAny(permissions: Permission[]): boolean {
  const { data: session } = useSession();

  return useMemo(() => {
    if (!session?.user?.permissions) {
      return false;
    }

    const context: UserPermissionsContext = {
      userId: session.user.id,
      roleId: session.user.roleId || "",
      roleName: session.user.role?.name || "user",
      permissions: session.user.permissions,
      loadedAt: Date.now(),
    };

    return hasPermission(context, permissions, { strict: false }) as boolean;
  }, [session, permissions]);
}

/**
 * Hook to check if user has ALL of the specified permissions (AND logic)
 */
export function useCanAll(permissions: Permission[]): boolean {
  const { data: session } = useSession();

  return useMemo(() => {
    if (!session?.user?.permissions) {
      return false;
    }

    const context: UserPermissionsContext = {
      userId: session.user.id,
      roleId: session.user.roleId || "",
      roleName: session.user.role?.name || "user",
      permissions: session.user.permissions,
      loadedAt: Date.now(),
    };

    return hasPermission(context, permissions, { strict: true }) as boolean;
  }, [session, permissions]);
}

/**
 * Hook to get user role
 */
export function useRole() {
  const { data: session } = useSession();

  return useMemo(() => {
    return session?.user?.role?.name || null;
  }, [session]);
}

/**
 * Hook to get user permissions
 */
export function usePermissions() {
  const { session } = useAuth();

  return useMemo(() => {
    return session?.user?.permissions || [];
  }, [session]);
}
