import { getDatabase } from "@/config/database";
import { users, userSessions } from "@/features/database/models/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { hash, compare } from "bcrypt";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/features/database/models/schema";
import type { ChangePasswordInput } from "./validations";

/**
 * Change user password
 */
export async function changePassword(userId: string, input: ChangePasswordInput) {
  const db = getDatabase()!;
  const user = await (db as unknown as PostgresJsDatabase<typeof schema>).query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || !user.passwordHash) {
    throw new Error("User not found");
  }

  const isValid = await compare(input.currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  const newPasswordHash = await hash(input.newPassword, 12);

  await db
    .update(users)
    .set({
      passwordHash: newPasswordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Revoke all other sessions (simplified - in production, track current session)
  // For now, we'll revoke all sessions requiring user to re-login
  await db.delete(userSessions).where(eq(userSessions.userId, userId));

  return { success: true };
}

/**
 * Get active sessions for user
 */
export async function getUserSessions(userId: string) {
  const db = getDatabase()!;
  const sessions = await (
    db as unknown as PostgresJsDatabase<typeof schema>
  ).query.userSessions.findMany({
    where: eq(userSessions.userId, userId),
    orderBy: [desc(userSessions.lastActive)],
  });

  return sessions;
}

/**
 * Revoke a session
 */
export async function revokeSession(sessionId: string, userId: string) {
  const db = getDatabase()!;
  await db
    .delete(userSessions)
    .where(and(eq(userSessions.id, sessionId), eq(userSessions.userId, userId)));
}
