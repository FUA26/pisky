import { success, handleError, noContent } from "@/shared/api";
import { validateParams, validateBody } from "@/shared/api/validation";
import {
  requireAuth,
  requirePermission,
  clearPermissionCache,
} from "@/features/auth/permissions/permissions";
import { getUserById, updateUser, deleteUser } from "@/features/admin/users/api";
import { updateUserSchema, userIdParamsSchema } from "@/features/admin/users/validations";
import { logActionFromRequest } from "@/features/admin/audit-logs/service";
import type { NextRequest } from "next/server";

/**
 * GET /api/admin/users/:id - Get a single user
 *
 * Permissions: ADMIN_USERS_MANAGE
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate and check permissions
    const session = await requireAuth();
    await requirePermission(session.user.id, "ADMIN_USERS_MANAGE");

    // Validate user ID
    const { id } = validateParams(await params, userIdParamsSchema);

    // Get user
    const user = await getUserById(id);
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return success(user);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/admin/users/:id - Update a user
 *
 * Permissions: ADMIN_USERS_MANAGE
 * Prevents self-modification
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate and check permissions
    const session = await requireAuth();
    await requirePermission(session.user.id, "ADMIN_USERS_MANAGE");

    // Validate user ID
    const { id } = validateParams(await params, userIdParamsSchema);

    // Prevent self-modification
    if (id === session.user.id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Cannot modify your own account through this endpoint",
          },
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate request body
    const body = await validateBody(request, updateUserSchema);

    // Get old user data for audit
    const oldUser = await getUserById(id);
    if (!oldUser) {
      return new Response(
        JSON.stringify({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update user
    const updatedUser = await updateUser(id, body, session.user.id);

    // Clear permission cache if role changed
    if (body.roleId && body.roleId !== oldUser.roleId) {
      clearPermissionCache(id);
    }

    // Log audit action
    await logActionFromRequest(request, {
      userId: session.user.id,
      action: "USER_UPDATE",
      entityType: "user",
      entityId: id,
      oldData: {
        email: oldUser.email,
        name: oldUser.name,
        roleId: oldUser.roleId,
      },
      newData: {
        email: updatedUser.email,
        name: updatedUser.name,
        roleId: updatedUser.roleId,
      },
    });

    return success(updatedUser);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/admin/users/:id - Delete a user
 *
 * Permissions: ADMIN_USERS_MANAGE
 * Prevents self-deletion
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and check permissions
    const session = await requireAuth();
    await requirePermission(session.user.id, "ADMIN_USERS_MANAGE");

    // Validate user ID
    const { id } = validateParams(await params, userIdParamsSchema);

    // Prevent self-deletion
    if (id === session.user.id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "FORBIDDEN", message: "Cannot delete your own account" },
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get user data for audit
    const user = await getUserById(id);
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Delete user
    await deleteUser(id, session.user.id);

    // Log audit action
    await logActionFromRequest(request, {
      userId: session.user.id,
      action: "USER_DELETE",
      entityType: "user",
      entityId: id,
      oldData: {
        email: user.email,
        name: user.name,
        roleId: user.roleId,
      },
    });

    return noContent();
  } catch (error) {
    return handleError(error);
  }
}
