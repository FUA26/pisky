import { getDatabase } from "@/config/database";
import { users, userProfiles } from "@/features/database/models/schema";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/features/database/models/schema";
import type { UpdateProfileInput, UpdatePreferencesInput } from "./validations";

/**
 * Get user profile with details
 */
export async function getUserProfile(userId: string) {
  const db = getDatabase()!;
  const user = await (db as unknown as PostgresJsDatabase<typeof schema>).query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
    with: {
      profile: true,
    },
  });

  return user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, input: UpdateProfileInput) {
  const db = getDatabase()!;

  // Update user table
  await db
    .update(users)
    .set({
      name: input.name,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Update or insert profile
  const existingProfile = await (
    db as unknown as PostgresJsDatabase<typeof schema>
  ).query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  });

  if (existingProfile) {
    await db
      .update(userProfiles)
      .set({
        bio: input.bio,
        phone: input.phone,
        address: input.address,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({
      userId,
      bio: input.bio,
      phone: input.phone,
      address: input.address,
    });
  }

  return getUserProfile(userId);
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(userId: string, input: UpdatePreferencesInput) {
  const db = getDatabase()!;

  const existingProfile = await (
    db as unknown as PostgresJsDatabase<typeof schema>
  ).query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  });

  const currentPrefs = (existingProfile as any)?.preferences || {};
  const newPrefs = { ...currentPrefs, ...input };

  if (existingProfile) {
    await db
      .update(userProfiles)
      .set({
        preferences: newPrefs,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({
      userId,
      preferences: newPrefs,
    });
  }

  return getUserProfile(userId);
}
