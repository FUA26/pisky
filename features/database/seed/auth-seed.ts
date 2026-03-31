import { getDatabase } from "@/config/database";
import { roles, permissions, rolePermissions, users } from "@/features/database/models/schema";
import { hash } from "bcrypt";
import { eq } from "drizzle-orm";

const PERMISSIONS = [
  // User Management
  { name: "USER_READ_OWN", category: "USER", description: "Read own user data" },
  { name: "USER_READ_ANY", category: "USER", description: "Read any user data" },
  { name: "USER_UPDATE_OWN", category: "USER", description: "Update own user data" },
  { name: "USER_UPDATE_ANY", category: "USER", description: "Update any user data" },
  { name: "USER_DELETE_OWN", category: "USER", description: "Delete own user data" },
  { name: "USER_DELETE_ANY", category: "USER", description: "Delete any user data" },
  { name: "USER_CREATE", category: "USER", description: "Create new users" },
  // Content Management
  { name: "CONTENT_READ_OWN", category: "CONTENT", description: "Read own content" },
  { name: "CONTENT_READ_ANY", category: "CONTENT", description: "Read any content" },
  { name: "CONTENT_CREATE", category: "CONTENT", description: "Create content" },
  { name: "CONTENT_UPDATE_OWN", category: "CONTENT", description: "Update own content" },
  { name: "CONTENT_UPDATE_ANY", category: "CONTENT", description: "Update any content" },
  { name: "CONTENT_DELETE_OWN", category: "CONTENT", description: "Delete own content" },
  { name: "CONTENT_DELETE_ANY", category: "CONTENT", description: "Delete any content" },
  { name: "CONTENT_PUBLISH", category: "CONTENT", description: "Publish content" },
  { name: "CONTENT_ARCHIVE", category: "CONTENT", description: "Archive content" },
  // File Management
  { name: "FILE_UPLOAD_OWN", category: "FILE", description: "Upload own files" },
  { name: "FILE_UPLOAD_ANY", category: "FILE", description: "Upload any files" },
  { name: "FILE_READ_OWN", category: "FILE", description: "Read own files" },
  { name: "FILE_READ_ANY", category: "FILE", description: "Read any files" },
  { name: "FILE_DELETE_OWN", category: "FILE", description: "Delete own files" },
  { name: "FILE_DELETE_ANY", category: "FILE", description: "Delete any files" },
  { name: "FILE_MANAGE_ORPHANS", category: "FILE", description: "Manage orphan files" },
  { name: "FILE_ADMIN", category: "FILE", description: "Full file administration" },
  // Settings
  { name: "SETTINGS_READ", category: "SETTINGS", description: "Read settings" },
  { name: "SETTINGS_UPDATE", category: "SETTINGS", description: "Update settings" },
  // Analytics
  { name: "ANALYTICS_VIEW", category: "ANALYTICS", description: "View analytics" },
  { name: "ANALYTICS_EXPORT", category: "ANALYTICS", description: "Export analytics" },
  // Admin
  { name: "ADMIN_PANEL_ACCESS", category: "ADMIN", description: "Access admin panel" },
  { name: "ADMIN_USERS_MANAGE", category: "ADMIN", description: "Manage users" },
  { name: "ADMIN_ROLES_MANAGE", category: "ADMIN", description: "Manage roles" },
  { name: "ADMIN_PERMISSIONS_MANAGE", category: "ADMIN", description: "Manage permissions" },
  {
    name: "ADMIN_SYSTEM_SETTINGS_MANAGE",
    category: "ADMIN",
    description: "Manage system settings",
  },
];

/**
 * Seeds the database with initial authentication data including roles, permissions, and a default admin user.
 *
 * This function is idempotent - it checks if the admin role already exists before attempting to create data.
 * If the admin role exists, the function exits early without making any changes.
 *
 * Default admin credentials created:
 * - Email: admin@pisky.com
 * - Password: admin123
 *
 * @throws {Error} If database operations fail (e.g., connection issues, constraint violations)
 * @returns {Promise<void>}
 */
export async function seedAuthData() {
  try {
    const db = getDatabase();
    if (!db) throw new Error("Database not available");

    console.log("Seeding roles and permissions...");

    // Idempotency check: Verify if admin role already exists
    const existingAdminRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, "admin"))
      .then((rows) => rows[0]);

    if (existingAdminRole) {
      console.log("Admin role already exists. Skipping auth seed.");
      return;
    }

    // Create admin role
    const [adminRole] = await db
      .insert(roles)
      .values({
        name: "admin",
        description: "Administrator with full access to all features",
      })
      .returning();

    // Create user role
    const [userRole] = await db
      .insert(roles)
      .values({
        name: "user",
        description: "Standard user with basic permissions",
      })
      .returning();

    console.log(`Created roles: admin (${adminRole.id}), user (${userRole.id})`);

    // Insert all permissions
    const insertedPermissions = await db.insert(permissions).values(PERMISSIONS).returning();

    console.log(`Created ${insertedPermissions.length} permissions`);

    // Assign all permissions to admin role using bulk insert
    await db.insert(rolePermissions).values(
      insertedPermissions.map((permission) => ({
        roleId: adminRole.id,
        permissionId: permission.id,
      }))
    );

    console.log(`Assigned all permissions to admin role`);

    // Assign basic permissions to user role
    const basicPermissions = [
      "USER_READ_OWN",
      "USER_UPDATE_OWN",
      "CONTENT_READ_OWN",
      "CONTENT_CREATE",
      "CONTENT_UPDATE_OWN",
      "CONTENT_DELETE_OWN",
      "FILE_UPLOAD_OWN",
      "FILE_READ_OWN",
      "FILE_DELETE_OWN",
      "ANALYTICS_VIEW",
    ];

    const userPermissionIds = insertedPermissions
      .filter((p) => basicPermissions.includes(p.name))
      .map((p) => ({
        roleId: userRole.id,
        permissionId: p.id,
      }));

    // Bulk insert for user role permissions
    await db.insert(rolePermissions).values(userPermissionIds);

    console.log(`Assigned ${basicPermissions.length} basic permissions to user role`);

    // Create default admin user (email: admin@pisky.com, password: admin123)
    const hashedPassword = await hash("admin123", 10);

    const [adminUser] = await db
      .insert(users)
      .values({
        name: "Admin",
        email: "admin@pisky.com",
        passwordHash: hashedPassword,
        emailVerified: new Date(),
        roleId: adminRole.id,
      })
      .returning();

    console.log(`Created default admin user: admin@pisky.com / admin123`);

    console.log("Auth seeding completed!");
  } catch (error) {
    console.error("Failed to seed auth data:", error);
    throw error;
  }
}
