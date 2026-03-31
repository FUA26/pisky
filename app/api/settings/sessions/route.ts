import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/features/auth/permissions/permissions";
import { getUserSessions } from "@/features/security/api";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const sessions = await getUserSessions(session.user.id);

    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
