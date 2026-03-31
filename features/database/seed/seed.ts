import { getDatabase } from "@/config/database";
import { users } from "@/features/database/models/schema";
import { seedAuthData } from "./auth-seed";

export async function seed() {
  const db = getDatabase();

  // Check if already seeded
  const existing = await db.select().from(users).limit(1);
  if (existing.length > 0) {
    console.log("Database already seeded");
    return;
  }

  // Add seed data
  await db.insert(users).values({
    name: "Demo User",
    email: "demo@example.com",
    emailVerified: new Date(),
  });

  console.log("Database seeded successfully");

  // Seed auth data (roles, permissions, admin user)
  await seedAuthData();
}

seed().catch(console.error);
