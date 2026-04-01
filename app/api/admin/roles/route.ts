import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/features/auth/permissions/permissions";
import { listRoles, createRole } from "@/features/admin/roles/api";
import { createRoleSchema } from "@/features/admin/roles/validations";
import { logAction, extractIpAddress, extractUserAgent } from "@/features/admin/audit-logs/service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "roles:read");

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    const result = await listRoles(filters);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "roles:manage");

    const body = await request.json();
    const input = createRoleSchema.parse(body);

    const newRole = await createRole(input);

    await logAction({
      userId: session.user.id,
      action: "role.created",
      entityType: "role",
      entityId: (newRole as any).id,
      newData: { name: (newRole as any).name, parentRoleId: input.parentRoleId },
      ipAddress: extractIpAddress(request),
      userAgent: extractUserAgent(request),
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
