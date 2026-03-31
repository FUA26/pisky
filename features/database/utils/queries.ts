import { eq, and } from "drizzle-orm";
import { getDatabase } from "@/config/database";
import {
  users,
  sessions,
  accounts,
  verificationTokens,
  type User,
  type NewUser,
  type Session,
  type NewSession,
  type Account,
  type NewAccount,
} from "../models/schema";

/**
 * Get database instance or throw error
 */
function getDb() {
  const db = getDatabase();
  if (!db) throw new Error("Database not available");
  return db;
}

// User queries
export async function getUserById(id: string): Promise<User | undefined> {
  const db = getDb();
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = getDb();
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function createUser(data: NewUser): Promise<User> {
  const db = getDb();
  const result = await db.insert(users).values(data).returning();
  return result[0];
}

export async function updateUser(id: string, data: Partial<NewUser>): Promise<User | undefined> {
  const db = getDb();
  const result = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return result[0];
}

export async function deleteUser(id: string): Promise<void> {
  const db = getDb();
  await db.delete(users).where(eq(users.id, id));
}

// Session queries
export async function getSessionByToken(token: string): Promise<Session | undefined> {
  const db = getDb();
  const result = await db.select().from(sessions).where(eq(sessions.sessionToken, token)).limit(1);
  return result[0];
}

export async function createSession(data: NewSession): Promise<Session> {
  const db = getDb();
  const result = await db.insert(sessions).values(data).returning();
  return result[0];
}

export async function deleteSession(token: string): Promise<void> {
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.sessionToken, token));
}

export async function deleteSessionsByUserId(userId: string): Promise<void> {
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

// Account queries
export async function getAccountByProvider(
  provider: string,
  providerAccountId: string
): Promise<Account | undefined> {
  const db = getDb();
  const result = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.provider, provider), eq(accounts.providerAccountId, providerAccountId)))
    .limit(1);
  return result[0];
}

export async function createAccount(data: NewAccount): Promise<Account> {
  const db = getDb();
  const result = await db.insert(accounts).values(data).returning();
  return result[0];
}

// Verification token queries
export async function getVerificationToken(identifier: string, token: string) {
  const db = getDb();
  const result = await db
    .select()
    .from(verificationTokens)
    .where(and(eq(verificationTokens.identifier, identifier), eq(verificationTokens.token, token)))
    .limit(1);
  return result[0];
}

export async function createVerificationToken(identifier: string, token: string, expires: Date) {
  const db = getDb();
  const result = await db
    .insert(verificationTokens)
    .values({ identifier, token, expires })
    .returning();
  return result[0];
}

export async function deleteVerificationToken(identifier: string, token: string): Promise<void> {
  const db = getDb();
  await db
    .delete(verificationTokens)
    .where(and(eq(verificationTokens.identifier, identifier), eq(verificationTokens.token, token)));
}
