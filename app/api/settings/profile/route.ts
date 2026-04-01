import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/features/auth/permissions/permissions";
import { getUserProfile, updateUserProfile, updateUserPreferences } from "@/features/profile/api";
import { updateProfileSchema, updatePreferencesSchema } from "@/features/profile/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const profile = await getUserProfile(session.user.id);

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();

    if (body.preferences) {
      const input = updatePreferencesSchema.parse(body);
      const updated = await updateUserPreferences(session.user.id, input);
      return NextResponse.json(updated);
    }

    const input = updateProfileSchema.parse(body);
    const updated = await updateUserProfile(session.user.id, input);

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
