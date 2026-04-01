import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/features/auth/permissions/permissions";
import { revokeSession } from "@/features/security/api";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    await revokeSession(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
