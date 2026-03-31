import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  requirePermission,
  clearPermissionCacheForRole,
} from "@/features/auth/permissions/permissions";
import { getRoleById, updateRole, deleteRole, getRoleUsers } from "@/features/admin/roles/api";
import { updateRoleSchema } from "@/features/admin/roles/validations";
import { logAction, extractIpAddress, extractUserAgent } from "@/features/admin/audit-logs/service";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    await requirePermission(session.user.id, "roles:read");

    const role = await getRoleById(id);

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json(role);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    await requirePermission(session.user.id, "roles:manage");

    const oldRole = await getRoleById(id);
    if (!oldRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const body = await request.json();
    const input = updateRoleSchema.parse(body);

    const updatedRole = await updateRole(id, input);

    await logAction({
      userId: session.user.id,
      action: "role.updated",
      entityType: "role",
      entityId: id,
      oldData: { name: (oldRole as any).name, parentRoleId: (oldRole as any).parentRoleId },
      newData: input,
      ipAddress: extractIpAddress(request),
      userAgent: extractUserAgent(request),
    });

    // Clear permission cache for all users with this role
    await clearPermissionCacheForRole(id);

    return NextResponse.json(updatedRole);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    await requirePermission(session.user.id, "roles:manage");

    const role = await getRoleById(id);
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const deletedRole = await deleteRole(id);

    await logAction({
      userId: session.user.id,
      action: "role.deleted",
      entityType: "role",
      entityId: id,
      oldData: { name: (role as any).name },
      ipAddress: extractIpAddress(request),
      userAgent: extractUserAgent(request),
    });

    return NextResponse.json(deletedRole);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
