import { getDatabase } from "@/config/database";
import { permissions } from "@/features/database/models/schema";

const defaultPermissions = [
  // Users
  { name: "users:read", category: "users", description: "View users" },
  { name: "users:create", category: "users", description: "Create users" },
  { name: "users:update", category: "users", description: "Update users" },
  { name: "users:delete", category: "users", description: "Delete users" },

  // Roles
  { name: "roles:read", category: "roles", description: "View roles" },
  { name: "roles:manage", category: "roles", description: "Manage roles" },

  // Audit
  { name: "audit:read", category: "audit", description: "View audit logs" },

  // Content
  { name: "content:read", category: "content", description: "View content" },
  { name: "content:create", category: "content", description: "Create content" },
  { name: "content:update", category: "content", description: "Update content" },
  { name: "content:delete", category: "content", description: "Delete content" },
  { name: "content:moderate", category: "content", description: "Moderate content" },

  // System
  { name: "system:settings", category: "system", description: "Manage system settings" },
];

export async function seedPermissions() {
  const db = getDatabase()!;

  console.log("Seeding permissions...");

  for (const permission of defaultPermissions) {
    await db.insert(permissions).values(permission).onConflictDoNothing();
  }

  console.log(`Seeded ${defaultPermissions.length} permissions`);
}
