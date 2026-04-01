import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/features/auth/permissions/permissions";
import { getDatabase } from "@/config/database";
import { permissions } from "@/features/database/models/schema";
import { asc } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/features/database/models/schema";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "roles:read");

    const db = getDatabase()!;
    const allPermissions = await (db as unknown as PostgresJsDatabase<typeof schema>)
      .select()
      .from(permissions)
      .orderBy(asc(permissions.category), asc(permissions.name));

    // Group by category
    const grouped = allPermissions.reduce(
      (acc, perm) => {
        const category = perm.category || "other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(perm);
        return acc;
      },
      {} as Record<string, typeof allPermissions>
    );

    return NextResponse.json({ grouped, all: allPermissions });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
