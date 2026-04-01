import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/features/auth/permissions/permissions";
import { changePassword } from "@/features/security/api";
import { changePasswordSchema } from "@/features/security/validations";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const input = changePasswordSchema.parse(body);

    await changePassword(session.user.id, input);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
