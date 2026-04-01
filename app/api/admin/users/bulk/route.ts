import { success, handleError } from "@/shared/api";
import { z } from "zod";
import {
  requireAuth,
  requirePermission,
  clearPermissionCache,
} from "@/features/auth/permissions/permissions";
import { bulkDeleteUsers, bulkAssignRole } from "@/features/admin/users/api";
import { bulkDeleteSchema, bulkAssignRoleSchema } from "@/features/admin/users/validations";
import { logActionFromRequest } from "@/features/admin/audit-logs/service";
import type { NextRequest } from "next/server";

// Schema for bulk operation request
const bulkOperationSchema = z.object({
  operation: z.enum(["delete", "assignRole"]),
  userIds: z.array(z.string().uuid()).min(1),
  roleId: z.string().uuid().optional(),
});

/**
 * POST /api/admin/users/bulk - Bulk operations on users
 *
 * Supports:
 * - Bulk delete
 * - Bulk role assignment
 *
 * Permissions: ADMIN_USERS_MANAGE
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate and check permissions
    const session = await requireAuth();
    await requirePermission(session.user.id, "ADMIN_USERS_MANAGE");

    // Parse and validate request body
    const body = await request.json();

    // Validate operation type first
    const operationValidation = bulkOperationSchema.safeParse(body);
    if (!operationValidation.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Invalid operation. Use 'delete' or 'assignRole' with valid userIds",
          },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { operation } = operationValidation.data;

    if (operation === "delete") {
      // Validate bulk delete input
      const { userIds } = bulkDeleteSchema.parse(body);

      // Prevent self-deletion
      if (userIds.includes(session.user.id)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: { code: "FORBIDDEN", message: "Cannot delete your own account" },
          }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      // Perform bulk delete
      const result = await bulkDeleteUsers({ userIds }, session.user.id);

      // Log audit action
      await logActionFromRequest(request, {
        userId: session.user.id,
        action: "USER_BULK_DELETE",
        entityType: "user",
        newData: {
          count: result.count,
          userIds: result.users.map((u) => u.id),
        },
      });

      return success({
        count: result.count,
        users: result.users,
      });
    } else if (operation === "assignRole") {
      // Validate bulk role assignment input
      const { userIds, roleId } = bulkAssignRoleSchema.parse(body);

      // Get current roles for audit
      const { getUserById } = await import("@/features/admin/users/api");
      const usersWithRolesBefore = await Promise.all(
        userIds.map(async (id) => {
          const user = await getUserById(id);
          return { id, roleId: user?.roleId };
        })
      );

      // Perform bulk role assignment
      const result = await bulkAssignRole({ userIds, roleId }, session.user.id);

      // Clear permission cache for all affected users
      for (const userId of userIds) {
        clearPermissionCache(userId);
      }

      // Log audit action
      await logActionFromRequest(request, {
        userId: session.user.id,
        action: "USER_BULK_ASSIGN_ROLE",
        entityType: "user",
        newData: {
          count: result.count,
          roleId,
          userIds,
        },
        oldData: {
          users: usersWithRolesBefore,
        },
      });

      return success({
        count: result.count,
        users: result.users,
        roleId,
      });
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: { code: "BAD_REQUEST", message: "Invalid operation. Use 'delete' or 'assignRole'" },
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return handleError(error);
  }
}
