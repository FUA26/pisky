import { success, created, handleError } from "@/shared/api";
import { validateBody, validateQuery } from "@/shared/api/validation";
import { requireAuth, requirePermission } from "@/features/auth/permissions/permissions";
import { getUsers, createUser } from "@/features/admin/users/api";
import { createUserSchema, userQuerySchema } from "@/features/admin/users/validations";
import { logActionFromRequest } from "@/features/admin/audit-logs/service";
import type { NextRequest } from "next/server";

/**
 * GET /api/admin/users - List users with pagination, search, and filtering
 *
 * Permissions: ADMIN_USERS_MANAGE
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate and check permissions
    const session = await requireAuth();
    await requirePermission(session.user.id, "ADMIN_USERS_MANAGE");

    // Validate query parameters
    const params = validateQuery(request.nextUrl.searchParams, userQuerySchema);

    // Get users
    const result = await getUsers(params);

    return success(result.users, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      hasMore: result.hasMore,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/admin/users - Create a new user
 *
 * Permissions: ADMIN_USERS_MANAGE
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate and check permissions
    const session = await requireAuth();
    await requirePermission(session.user.id, "ADMIN_USERS_MANAGE");

    // Validate request body
    const body = await validateBody(request, createUserSchema);

    // Create user
    const newUser = await createUser(body, session.user.id);

    // Log audit action
    await logActionFromRequest(request, {
      userId: session.user.id,
      action: "USER_CREATE",
      entityType: "user",
      entityId: newUser.id,
      newData: {
        email: newUser.email,
        name: newUser.name,
        roleId: newUser.roleId,
      },
    });

    return created(newUser);
  } catch (error) {
    return handleError(error);
  }
}
