# Auth System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement complete authentication system with credentials (email/password), email verification, password reset, registration, and RBAC with roles & permissions for the Pisky project.

**Architecture:** Feature-based auth structure using NextAuth.js v5 with JWT sessions, Drizzle ORM for database, bcrypt for password hashing, and a custom RBAC system for permission management. OAuth providers are disabled per requirements.

**Tech Stack:** Next.js 16, React 19, TypeScript, NextAuth.js v5, Drizzle ORM, bcrypt, Zod, Tailwind CSS 4, Shadcn UI

---

## Task 1: Update Database Schema for RBAC

**Files:**

- Modify: `features/database/models/schema.ts`

Add RBAC tables and modify users table to support roles and permissions.

- [ ] **Step 1: Add RBAC tables to schema**

Open `features/database/models/schema.ts` and add the following tables after the existing tables:

```typescript
import { pgTable, text, timestamp, boolean, uuid, varchar } from "drizzle-orm/pg-core";

// RBAC Tables

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const permissions = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const rolePermissions = pgTable("role_permissions", {
  roleId: uuid("roleId")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  permissionId: uuid("permissionId")
    .notNull()
    .references(() => permissions.id, { onDelete: "cascade" }),
});

// Add composite primary key
rolePermissions.primaryKey = [rolePermissions.roleId, rolePermissions.permissionId];
```

- [ ] **Step 2: Add password reset fields to users table**

In the existing `users` table, add password reset fields:

```typescript
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified"), // Changed from boolean to timestamp
  image: text("image"),
  passwordHash: text("passwordHash"),
  roleId: uuid("roleId").references(() => roles.id), // Add roleId
  passwordResetToken: text("passwordResetToken"), // Add password reset token
  passwordResetExpires: timestamp("passwordResetExpires", { mode: "date" }), // Add expiration
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
```

- [ ] **Step 3: Export new types**

Add to the type exports at the bottom of the file:

```typescript
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
```

- [ ] **Step 4: Run database migration**

Run: `pnpm db:push`
Expected: Database schema updated with new tables and columns

- [ ] **Step 5: Commit**

```bash
git add features/database/models/schema.ts
git commit -m "feat: add RBAC tables and password reset fields to schema

- Add roles, permissions, role_permissions tables
- Add roleId, passwordResetToken, passwordResetExpires to users
- Change emailVerified from boolean to timestamp

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Seed Data for Roles and Permissions

**Files:**

- Create: `features/database/seed/auth-seed.ts`

Create seed data with default roles and all permissions from bandanaiera_boilerplate.

- [ ] **Step 1: Create the seed file**

Create `features/database/seed/auth-seed.ts`:

```typescript
import { getDatabase } from "@/config/database";
import { roles, permissions, rolePermissions, users } from "@/features/database/models/schema";
import { hash } from "bcrypt";

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

export async function seedAuthData() {
  const db = getDatabase();

  console.log("Seeding roles and permissions...");

  // Create admin role
  const adminRole = await db
    .insert(roles)
    .values({
      name: "admin",
      description: "Administrator with full access to all features",
    })
    .returning()
    .then((rows) => rows[0]);

  // Create user role
  const userRole = await db
    .insert(roles)
    .values({
      name: "user",
      description: "Standard user with basic permissions",
    })
    .returning()
    .then((rows) => rows[0]);

  console.log(`Created roles: admin (${adminRole.id}), user (${userRole.id})`);

  // Insert all permissions
  const insertedPermissions = await db.insert(permissions).values(PERMISSIONS).returning();

  console.log(`Created ${insertedPermissions.length} permissions`);

  // Assign all permissions to admin role
  for (const permission of insertedPermissions) {
    await db.insert(rolePermissions).values({
      roleId: adminRole.id,
      permissionId: permission.id,
    });
  }

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

  for (const permName of basicPermissions) {
    const perm = insertedPermissions.find((p) => p.name === permName);
    if (perm) {
      await db.insert(rolePermissions).values({
        roleId: userRole.id,
        permissionId: perm.id,
      });
    }
  }

  console.log(`Assigned ${basicPermissions.length} basic permissions to user role`);

  // Create default admin user (email: admin@pisky.com, password: admin123)
  const hashedPassword = await hash("admin123", 10);

  const adminUser = await db
    .insert(users)
    .values({
      name: "Admin",
      email: "admin@pisky.com",
      passwordHash: hashedPassword,
      emailVerified: new Date(),
      roleId: adminRole.id,
    })
    .returning()
    .then((rows) => rows[0]);

  console.log(`Created default admin user: admin@pisky.com / admin123`);

  console.log("Auth seeding completed!");
}
```

- [ ] **Step 2: Update main seed file**

Modify `features/database/seed/seed.ts` to call the new seed function. Add this import and call:

```typescript
import { seedAuthData } from "./auth-seed";

// Inside main seed function, after existing seeds:
await seedAuthData();
```

- [ ] **Step 3: Run the seed**

Run: `pnpm db:seed` (or the appropriate seed command from package.json)
Expected: Roles, permissions, and default admin user created

- [ ] **Step 4: Commit**

```bash
git add features/database/seed/
git commit -m "feat: add RBAC seed data

- Create admin and user roles
- Seed 33 permissions across USER, CONTENT, FILE, SETTINGS, ANALYTICS, ADMIN categories
- Assign all permissions to admin role
- Assign basic permissions to user role
- Create default admin user (admin@pisky.com / admin123)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create Token Utilities

**Files:**

- Create: `lib/tokens.ts`

Create utilities for secure token generation and validation.

- [ ] **Step 1: Create token utilities file**

Create `lib/tokens.ts`:

```typescript
import crypto from "crypto";

/**
 * Generate a cryptographically secure random token
 */
function generateRandomToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Hash a token for secure storage
 * Uses SHA-256 for one-way hashing
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Check if a token has expired
 * @param expires - The expiration date of the token
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(expires: Date | null | undefined): boolean {
  if (!expires) return true;

  const now = new Date();
  const expirationDate = new Date(expires);

  return now > expirationDate;
}

/**
 * Calculate token expiration date
 * @param hours - Number of hours until token expires
 * @returns Date object representing expiration time
 */
export function getTokenExpiration(hours: number = 1): Date {
  const now = new Date();
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Generate a secure token with its hash and expiration
 * Useful for creating and storing tokens
 */
export function createSecureToken(hours: number = 1) {
  const token = generateRandomToken(32);
  const hashed = hashToken(token);
  const expires = getTokenExpiration(hours);

  return {
    token,
    hashed,
    expires,
  };
}

/**
 * Verify a token matches its hashed version
 * @param token - The plain text token
 * @param hashedToken - The stored hashed token
 * @returns true if tokens match
 */
export function verifyTokenHash(token: string, hashedToken: string): boolean {
  const hashedInput = hashToken(token);
  return hashedInput === hashedToken;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/tokens.ts
git commit -m "feat: add token utilities for password reset and email verification

- Secure token generation using crypto.randomBytes
- SHA-256 hashing for secure storage
- Token expiration checking
- Helper functions for token creation and verification

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create Mock Email Service

**Files:**

- Create: `lib/email.ts`

Create a mock email service that logs to console for development.

- [ ] **Step 1: Create email service**

Create `lib/email.ts`:

```typescript
interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
}

/**
 * Mock email service for development
 * In production, replace with actual email service like Resend, SendGrid, etc.
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  console.log("\n=== MOCK EMAIL SERVICE ===");
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Body: ${options.html}`);
  console.log("==========================\n");

  return { success: true };
}

/**
 * Email template types
 */
export type EmailTemplate =
  | "email-verification"
  | "password-reset"
  | "welcome"
  | "password-reset-confirm";

interface TemplateData {
  userName?: string;
  verifyUrl?: string;
  resetUrl?: string;
  loginUrl?: string;
  expiryHours?: number;
  title?: string;
  message?: string;
  actionText?: string;
  actionUrl?: string;
}

/**
 * Send email using template
 */
export async function sendTemplate(
  template: EmailTemplate,
  options: Omit<SendEmailOptions, "html"> & { data: TemplateData }
): Promise<EmailResult> {
  const html = generateTemplateHtml(template, options.data);
  return sendEmail({
    to: options.to,
    subject: options.subject,
    html,
  });
}

function generateTemplateHtml(template: EmailTemplate, data: TemplateData): string {
  const userName = data.userName || "User";

  switch (template) {
    case "email-verification":
      return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Verify Your Email Address</h2>
  <p>Hi ${userName},</p>
  <p>Please click the link below to verify your email address:</p>
  <p><a href="${data.verifyUrl}" style="background: #1B53D9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a></p>
  <p>This link will expire in ${data.expiryHours || 24} hours.</p>
</body>
</html>
      `.trim();

    case "password-reset":
      return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Reset Your Password</h2>
  <p>Hi ${userName},</p>
  <p>Click the link below to reset your password:</p>
  <p><a href="${data.resetUrl}" style="background: #1B53D9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
  <p>This link will expire in ${data.expiryHours || 1} hour.</p>
  <p>If you didn't request this, please ignore this email.</p>
</body>
</html>
      `.trim();

    case "password-reset-confirm":
      return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Password Successfully Reset</h2>
  <p>Hi ${userName},</p>
  <p>Your password has been successfully reset.</p>
  <p><a href="${data.loginUrl}" style="background: #1B53D9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Log In</a></p>
</body>
</html>
      `.trim();

    case "welcome":
      return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Welcome to Pisky!</h2>
  <p>Hi ${userName},</p>
  <p>Welcome to Pisky! Your account has been created successfully.</p>
  <p><a href="${data.loginUrl}" style="background: #1B53D9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Log In</a></p>
</body>
</html>
      `.trim();

    default:
      return "";
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/email.ts
git commit -m "feat: add mock email service for development

- Console-based email logging for development
- Email templates for verification, password reset, and welcome
- Template-based email sending function
- Ready to replace with real email service (Resend, SendGrid)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create Validation Schemas

**Files:**

- Create: `features/auth/validations/auth.ts`

Create Zod validation schemas for all auth forms.

- [ ] **Step 1: Create validation schemas**

Create `features/auth/validations/auth.ts`:

```typescript
import { z } from "zod";

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Registration form validation schema
 */
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Forgot password form validation schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

/**
 * Reset password form validation schema
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Email verification schema
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
```

- [ ] **Step 2: Commit**

```bash
git add features/auth/validations/auth.ts
git commit -m "feat: add auth validation schemas

- Login schema with email and password validation
- Registration schema with password confirmation
- Forgot password schema
- Reset password schema with token validation
- Email verification schema

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create RBAC Types and Checker

**Files:**

- Create: `features/auth/permissions/rbac-types.ts`
- Create: `features/auth/permissions/rbac-checker.ts`

Create RBAC type definitions and permission checking logic.

- [ ] **Step 1: Create RBAC types**

Create `features/auth/permissions/rbac-types.ts`:

```typescript
/**
 * All available permissions in the system
 * This type supports both predefined permissions and dynamic/custom permissions
 */
export type Permission =
  // User Management
  | "USER_READ_OWN"
  | "USER_READ_ANY"
  | "USER_UPDATE_OWN"
  | "USER_UPDATE_ANY"
  | "USER_DELETE_OWN"
  | "USER_DELETE_ANY"
  | "USER_CREATE"
  // Content Management
  | "CONTENT_READ_OWN"
  | "CONTENT_READ_ANY"
  | "CONTENT_CREATE"
  | "CONTENT_UPDATE_OWN"
  | "CONTENT_UPDATE_ANY"
  | "CONTENT_DELETE_OWN"
  | "CONTENT_DELETE_ANY"
  | "CONTENT_PUBLISH"
  // File Management
  | "FILE_UPLOAD_OWN"
  | "FILE_UPLOAD_ANY"
  | "FILE_READ_OWN"
  | "FILE_READ_ANY"
  | "FILE_DELETE_OWN"
  | "FILE_DELETE_ANY"
  | "FILE_MANAGE_ORPHANS"
  | "FILE_ADMIN"
  // Settings
  | "SETTINGS_READ"
  | "SETTINGS_UPDATE"
  // Analytics
  | "ANALYTICS_VIEW"
  | "ANALYTICS_EXPORT"
  // Admin
  | "ADMIN_PANEL_ACCESS"
  | "ADMIN_USERS_MANAGE"
  | "ADMIN_ROLES_MANAGE"
  | "ADMIN_PERMISSIONS_MANAGE"
  | "ADMIN_SYSTEM_SETTINGS_MANAGE"
  // Allow dynamic/custom permissions
  | string;

/**
 * Context containing user's permissions and role information
 */
export interface UserPermissionsContext {
  /** User ID */
  userId: string;
  /** Role ID */
  roleId: string;
  /** Role name */
  roleName: string;
  /** List of permissions assigned to the user's role */
  permissions: Permission[];
  /** Timestamp when permissions were loaded */
  loadedAt: number;
}

/**
 * Options for resource-level permission checks
 */
export interface PermissionCheckOptions {
  /** ID of the currently authenticated user */
  currentUserId?: string;
  /** ID of the resource owner (for OWN vs ANY checks) */
  resourceOwnerId?: string;
  /** If true, ALL permissions must be present (AND logic). Default: false (OR logic) */
  strict?: boolean;
}

/**
 * Result of a permission check
 */
export interface PermissionCheckResult {
  /** Whether the permission check passed */
  allowed: boolean;
  /** The specific permission that granted access (if any) */
  grantedBy?: Permission;
  /** Reason for denial (useful for debugging/UI feedback) */
  reason?: string;
}

/**
 * Database permission record interface
 */
export interface PermissionRecord {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  createdAt: Date;
}

/**
 * Role with permissions
 */
export interface RoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  permissions: Array<{
    permission: {
      name: string;
    };
  }>;
}
```

- [ ] **Step 2: Create RBAC checker**

Create `features/auth/permissions/rbac-checker.ts`:

````typescript
import type {
  Permission,
  PermissionCheckOptions,
  PermissionCheckResult,
  UserPermissionsContext,
} from "./rbac-types";

/**
 * Permission pairs for OWN vs ANY relationships
 * Used for automatic permission escalation (e.g., if you have ANY, you also have OWN)
 */
const OWN_ANY_PAIRS: Record<string, string> = {
  USER_READ_OWN: "USER_READ_ANY",
  USER_UPDATE_OWN: "USER_UPDATE_ANY",
  USER_DELETE_OWN: "USER_DELETE_ANY",
  CONTENT_READ_OWN: "CONTENT_READ_ANY",
  CONTENT_UPDATE_OWN: "CONTENT_UPDATE_ANY",
  CONTENT_DELETE_OWN: "CONTENT_DELETE_ANY",
  FILE_READ_OWN: "FILE_READ_ANY",
  FILE_UPLOAD_OWN: "FILE_UPLOAD_ANY",
  FILE_DELETE_OWN: "FILE_DELETE_ANY",
};

/**
 * Check if a user has the required permissions
 *
 * @param context - User's permission context (contains permissions array)
 * @param requiredPermissions - Array of permissions to check
 * @param options - Optional configuration for resource-level checks
 * @returns True if user has required permissions, false otherwise
 *
 * @example
 * ```ts
 * // Basic check (OR logic - any permission is sufficient)
 * hasPermission(userContext, ["USER_READ_ANY"])
 *
 * // Strict check (AND logic - all permissions required)
 * hasPermission(userContext, ["USER_UPDATE_ANY", "CONTENT_DELETE_ANY"], { strict: true })
 *
 * // Resource-level check (OWN vs ANY)
 * hasPermission(userContext, ["USER_UPDATE_OWN"], {
 *   currentUserId: "user-123",
 *   resourceOwnerId: "user-123"
 * })
 * ```
 */
export function hasPermission(
  context: UserPermissionsContext | null | undefined,
  requiredPermissions: Permission[],
  options?: PermissionCheckOptions
): boolean;

/**
 * Extended version that returns detailed check result
 */
export function hasPermission(
  context: UserPermissionsContext | null | undefined,
  requiredPermissions: Permission[],
  options?: PermissionCheckOptions
): PermissionCheckResult;

export function hasPermission(
  context: UserPermissionsContext | null | undefined,
  requiredPermissions: Permission[],
  options: PermissionCheckOptions = {}
): boolean | PermissionCheckResult {
  const { currentUserId, resourceOwnerId, strict = false } = options;

  // Handle missing context
  if (!context || !context.permissions) {
    return _makeResult(false, undefined, "No permission context provided");
  }

  const { permissions } = context;

  // If no permissions required, grant access
  if (requiredPermissions.length === 0) {
    return _makeResult(true, undefined, "No permissions required");
  }

  // Normalize permissions: ANY implies OWN for resource checks
  const normalizedPermissions = _normalizePermissions(permissions);

  // Check each required permission
  const results = requiredPermissions.map((requiredPerm) => {
    // Direct permission check
    if (normalizedPermissions.has(requiredPerm)) {
      return { allowed: true, grantedBy: requiredPerm };
    }

    // Resource-level check for OWN permissions
    if (requiredPerm.endsWith("_OWN") && currentUserId && resourceOwnerId) {
      const anyPermission = OWN_ANY_PAIRS[requiredPerm];

      // If user has ANY permission, they can access any resource
      if (anyPermission && normalizedPermissions.has(anyPermission as Permission)) {
        return { allowed: true, grantedBy: anyPermission as Permission };
      }

      // If user owns the resource and has OWN permission
      if (currentUserId === resourceOwnerId && normalizedPermissions.has(requiredPerm)) {
        return { allowed: true, grantedBy: requiredPerm };
      }
    }

    return { allowed: false, grantedBy: undefined };
  });

  // Apply strict (AND) vs non-strict (OR) logic
  if (strict) {
    // ALL permissions must be granted
    const allAllowed = results.every((r) => r.allowed);
    const grantedBy = allAllowed ? requiredPermissions[0] : undefined;
    const reason = allAllowed ? undefined : "Missing one or more required permissions";

    return _makeResult(allAllowed, grantedBy, reason);
  } else {
    // ANY permission is sufficient
    const anyAllowed = results.some((r) => r.allowed);
    const firstGranted = results.find((r) => r.allowed)?.grantedBy;
    const reason = anyAllowed ? undefined : "Missing required permissions";

    return _makeResult(anyAllowed, firstGranted, reason);
  }
}

/**
 * Normalize permissions by adding implied permissions
 * (e.g., if you have ANY, you also get OWN)
 */
function _normalizePermissions(permissions: Permission[]): Set<Permission> {
  const normalized = new Set(permissions);

  // Add implied OWN permissions for ANY permissions
  for (const [own, anyPerm] of Object.entries(OWN_ANY_PAIRS)) {
    if (normalized.has(anyPerm as Permission)) {
      normalized.add(own as Permission);
    }
  }

  return normalized;
}

/**
 * Make result object (handles both boolean and detailed result)
 */
function _makeResult(
  allowed: boolean,
  grantedBy?: Permission,
  reason?: string
): PermissionCheckResult {
  return {
    allowed,
    grantedBy,
    reason,
  };
}

/**
 * Type guard to check if value is a valid UserPermissionsContext
 */
export function isUserPermissionsContext(value: unknown): value is UserPermissionsContext {
  if (!value || typeof value !== "object") return false;

  const ctx = value as Record<string, unknown>;
  return (
    typeof ctx.userId === "string" &&
    typeof ctx.roleId === "string" &&
    typeof ctx.roleName === "string" &&
    Array.isArray(ctx.permissions) &&
    typeof ctx.loadedAt === "number"
  );
}
````

- [ ] **Step 3: Commit**

```bash
git add features/auth/permissions/
git commit -m "feat: add RBAC types and permission checker

- Define Permission type with all system permissions
- UserPermissionsContext for permission checking
- PermissionCheckOptions for resource-level checks
- hasPermission function with OWN/ANY scope support
- Permission normalization (ANY implies OWN)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Update NextAuth Configuration with RBAC

**Files:**

- Modify: `config/auth.ts`
- Modify: `auth.config.ts`

Update NextAuth to use credentials only and load roles/permissions into session.

- [ ] **Step 1: Replace auth.config.ts**

Replace the entire content of `auth.config.ts` with:

```typescript
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  // Use JWT strategy for stateless, scalable sessions
  session: { strategy: "jwt" },

  // Custom pages for authentication flow
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // Providers will be defined in config/auth.ts
  providers: [],

  callbacks: {
    /**
     * JWT callback - adds user role and permissions to token
     */
    async jwt({ token, user }) {
      // Only add user data on initial sign in
      if (user) {
        token.id = user.id;
        token.roleId = user.roleId;
        token.role = user.role;
        // Extract permissions as flat array for easier access
        if (user.role && user.role.permissions) {
          token.permissions = user.role.permissions.map((rp: any) => rp.permission.name);
        }
      }
      return token;
    },

    /**
     * Session callback - exposes token data to client
     */
    async session({ session, token }) {
      // Add user ID and role ID to session
      if (token.id) {
        session.user.id = token.id as string;
        session.user.roleId = token.roleId as string;
      }
      // Add full role object to session
      if (token.role) {
        session.user.role = token.role as {
          id: string;
          name: string;
          permissions: Array<{
            permission: {
              name: string;
            };
          }>;
        };
      }
      // Add flattened permissions array for easy checking
      if (token.permissions) {
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },
};
```

- [ ] **Step 2: Replace config/auth.ts**

Replace the entire content of `config/auth.ts` with:

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { compare } from "bcrypt";
import { z } from "zod";
import { getDatabase } from "./database";
import { users, roles, permissions, rolePermissions } from "../features/database/models/schema";
import { authConfig } from "../auth.config";
import type { RoleWithPermissions } from "../features/auth/permissions/rbac-types";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Validate credentials
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const db = getDatabase();

        // Find user by email
        const userResult = await db
          .select({
            user: users,
            role: {
              id: roles.id,
              name: roles.name,
              description: roles.description,
            },
          })
          .from(users)
          .leftJoin(roles, eq(users.roleId, roles.id))
          .where(eq(users.email, email))
          .limit(1);

        const userWithRole = userResult[0];

        if (!userWithRole?.user) {
          return null;
        }

        // Verify password if user has passwordHash
        if (userWithRole.user.passwordHash) {
          const isValid = await compare(password, userWithRole.user.passwordHash);
          if (!isValid) {
            return null;
          }
        } else {
          return null;
        }

        // Load role with permissions
        let roleWithPermissions: RoleWithPermissions | undefined = undefined;

        if (userWithRole.role) {
          // Get permissions for this role
          const rolePerms = await db
            .select({
              permission: {
                name: permissions.name,
              },
            })
            .from(rolePermissions)
            .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
            .where(eq(rolePermissions.roleId, userWithRole.role.id));

          roleWithPermissions = {
            ...userWithRole.role,
            permissions: rolePerms,
          };
        }

        // Return user object with role data for JWT
        return {
          id: userWithRole.user.id,
          email: userWithRole.user.email,
          name: userWithRole.user.name,
          image: userWithRole.user.image,
          roleId: userWithRole.user.roleId,
          role: roleWithPermissions,
        };
      },
    }),
  ],
});
```

- [ ] **Step 3: Update auth types**

Create or update `features/auth/types/auth-types.ts`:

```typescript
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleId: string | null;
      role?: {
        id: string;
        name: string;
        permissions: Array<{
          permission: {
            name: string;
          };
        }>;
      };
      permissions?: string[];
    } & DefaultSession["user"];
  }

  interface User {
    roleId: string | null;
    role?: {
      id: string;
      name: string;
      permissions: Array<{
        permission: {
          name: string;
        };
      }>;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roleId: string | null;
    role?: {
      id: string;
      name: string;
      permissions: Array<{
        permission: {
          name: string;
        };
      }>;
    };
    permissions?: string[];
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add config/auth.ts auth.config.ts features/auth/types/
git commit -m "feat: update NextAuth config with RBAC support

- Remove OAuth providers (credentials only)
- Load user role and permissions in authorize callback
- Add roleId, role, and permissions to JWT and session
- Update TypeScript declarations for session/user types

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Create Server-Side Permission Helpers

**Files:**

- Create: `features/auth/permissions/permissions.ts`

Create server-side helper functions for permission checking in API routes.

- [ ] **Step 1: Create permission helpers**

Create `features/auth/permissions/permissions.ts`:

```typescript
import { auth } from "@/config/auth";
import { hasPermission } from "./rbac-checker";
import { eq } from "drizzle-orm";
import { getDatabase } from "@/config/database";
import { roles, permissions, rolePermissions, users } from "@/features/database/models/schema";
import type { Permission, UserPermissionsContext } from "./rbac-types";

// Simple in-memory cache for permissions (5 minute TTL)
const permissionCache = new Map<string, { context: UserPermissionsContext; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Load user permissions from database with caching
 */
async function loadUserPermissions(userId: string): Promise<UserPermissionsContext> {
  // Check cache first
  const cached = permissionCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.context;
  }

  const db = getDatabase();

  // Get user with role
  const userResult = await db
    .select({
      user: users,
      role: {
        id: roles.id,
        name: roles.name,
      },
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.id, userId))
    .limit(1);

  const userWithRole = userResult[0];

  if (!userWithRole?.user) {
    throw new Error("User not found");
  }

  // Get permissions for this role
  const rolePerms = userWithRole.role
    ? await db
        .select({
          permission: {
            name: permissions.name,
          },
        })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, userWithRole.role.id))
    : [];

  const permissionList = rolePerms.map((rp) => rp.permission.name) as Permission[];

  const context: UserPermissionsContext = {
    userId: userWithRole.user.id,
    roleId: userWithRole.user.roleId || "",
    roleName: userWithRole.role?.name || "user",
    permissions: permissionList,
    loadedAt: Date.now(),
  };

  // Cache the result
  permissionCache.set(userId, {
    context,
    expiresAt: Date.now() + CACHE_TTL,
  });

  return context;
}

/**
 * Get the current authenticated session.
 * Returns the session with user attached, or throws if not authenticated.
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized: Authentication required");
  }

  return session;
}

/**
 * Check if a user has a specific permission.
 * Throws an error if permission check fails.
 */
export async function requirePermission(userId: string, permission: Permission): Promise<void> {
  const userPermissions = await loadUserPermissions(userId);
  const allowed = hasPermission(userPermissions, [permission]);

  if (!allowed) {
    throw new Error(`Forbidden: Missing required permission: ${permission}`);
  }
}

/**
 * Check if a user has ANY of the specified permissions.
 * Throws an error only if NONE of the permissions are granted.
 */
export async function requireAnyPermission(
  userId: string,
  permissions: Permission[]
): Promise<void> {
  const userPermissions = await loadUserPermissions(userId);
  const allowed = hasPermission(userPermissions, permissions, { strict: false });

  if (!allowed) {
    throw new Error(`Forbidden: Missing one of required permissions: ${permissions.join(", ")}`);
  }
}

/**
 * Check if a user has ALL of the specified permissions.
 * Throws an error if ANY permission is missing.
 */
export async function requireAllPermissions(
  userId: string,
  permissions: Permission[]
): Promise<void> {
  const userPermissions = await loadUserPermissions(userId);
  const allowed = hasPermission(userPermissions, permissions, { strict: true });

  if (!allowed) {
    throw new Error(`Forbidden: Missing required permissions: ${permissions.join(", ")}`);
  }
}

/**
 * Clear permission cache for a specific user
 */
export function clearPermissionCache(userId: string): void {
  permissionCache.delete(userId);
}

/**
 * Clear entire permission cache
 */
export function clearAllPermissionCache(): void {
  permissionCache.clear();
}
```

- [ ] **Step 2: Commit**

```bash
git add features/auth/permissions/permissions.ts
git commit -m "feat: add server-side permission helpers

- requireAuth() - Ensure user is authenticated
- requirePermission() - Check single permission
- requireAnyPermission() - Check multiple (OR logic)
- requireAllPermissions() - Check multiple (AND logic)
- In-memory cache for permission data (5 min TTL)
- Cache invalidation functions

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Create Client-Side Permission Hooks

**Files:**

- Create: `features/auth/permissions/hooks.ts`

Create React hooks for checking permissions in client components.

- [ ] **Step 1: Create permission hooks**

Create `features/auth/permissions/hooks.ts`:

```typescript
"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { hasPermission } from "./rbac-checker";
import type { Permission, UserPermissionsContext } from "./rbac-types";

/**
 * Hook to get current session with loading state
 */
export function useAuth() {
  const { data: session, status } = useSession();

  return {
    session,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isUnauthenticated: status === "unauthenticated",
  };
}

/**
 * Hook to check if user has a specific permission
 */
export function useCan(
  permission: Permission,
  options?: {
    currentUserId?: string;
    resourceOwnerId?: string;
  }
): boolean {
  const { data: session } = useSession();

  return useMemo(() => {
    if (!session?.user) {
      return false;
    }

    const context: UserPermissionsContext | null = session.user.permissions
      ? {
          userId: session.user.id,
          roleId: session.user.roleId || "",
          roleName: session.user.role?.name || "user",
          permissions: session.user.permissions,
          loadedAt: Date.now(),
        }
      : null;

    return hasPermission(context, [permission], options) as boolean;
  }, [session, permission, options]);
}

/**
 * Hook to check if user has ANY of the specified permissions (OR logic)
 */
export function useCanAny(permissions: Permission[]): boolean {
  const { data: session } = useSession();

  return useMemo(() => {
    if (!session?.user?.permissions) {
      return false;
    }

    const context: UserPermissionsContext = {
      userId: session.user.id,
      roleId: session.user.roleId || "",
      roleName: session.user.role?.name || "user",
      permissions: session.user.permissions,
      loadedAt: Date.now(),
    };

    return hasPermission(context, permissions, { strict: false }) as boolean;
  }, [session, permissions]);
}

/**
 * Hook to check if user has ALL of the specified permissions (AND logic)
 */
export function useCanAll(permissions: Permission[]): boolean {
  const { data: session } = useSession();

  return useMemo(() => {
    if (!session?.user?.permissions) {
      return false;
    }

    const context: UserPermissionsContext = {
      userId: session.user.id,
      roleId: session.user.roleId || "",
      roleName: session.user.role?.name || "user",
      permissions: session.user.permissions,
      loadedAt: Date.now(),
    };

    return hasPermission(context, permissions, { strict: true }) as boolean;
  }, [session, permissions]);
}

/**
 * Hook to get user role
 */
export function useRole() {
  const { data: session } = useSession();

  return useMemo(() => {
    return session?.user?.role?.name || null;
  }, [session]);
}

/**
 * Hook to get user permissions
 */
export function usePermissions() {
  const { data: session } = useSession();

  return useMemo(() => {
    return session?.user?.permissions || [];
  }, [session]);
}
```

- [ ] **Step 2: Commit**

```bash
git add features/auth/permissions/hooks.ts
git commit -m "feat: add client-side permission hooks

- useAuth() - Get session with loading states
- useCan() - Check single permission
- useCanAny() - Check multiple permissions (OR)
- useCanAll() - Check multiple permissions (AND)
- useRole() - Get user role name
- usePermissions() - Get user permissions array

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Create Registration API Route

**Files:**

- Create: `app/api/auth/register/route.ts`

Create API endpoint for user registration.

- [ ] **Step 1: Create registration API**

Create `app/api/auth/register/route.ts`:

```typescript
import { getDatabase } from "@/config/database";
import { sendTemplate } from "@/lib/email";
import { createSecureToken } from "@/lib/tokens";
import { registerSchema } from "@/features/auth/validations/auth";
import {
  users,
  roles,
  permissions,
  rolePermissions,
  verificationTokens,
} from "@/features/database/models/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/register
 * Register a new user
 */
export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    const db = getDatabase();

    // Get default user role
    const userRole = await db.select().from(roles).where(eq(roles.name, "user")).limit(1);

    if (!userRole[0]) {
      return NextResponse.json(
        {
          error: "Configuration Error",
          message: "Default user role not found. Please run seed.",
        },
        { status: 500 }
      );
    }

    // Check if email already exists (but don't reveal this for security)
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser[0]) {
      // Always return success to prevent email enumeration
      console.log(`[Auth] Registration attempt with existing email: ${validatedData.email}`);

      return NextResponse.json(
        {
          message: "Registration successful. Please check your email to verify your account.",
          requireEmailVerification: true,
        },
        { status: 200 }
      );
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 10);

    // Create user
    const user = await db
      .insert(users)
      .values({
        name: validatedData.name,
        email: validatedData.email,
        passwordHash: hashedPassword,
        roleId: userRole[0].id,
        emailVerified: null, // Require email verification
      })
      .returning();

    // Generate verification token (24 hour expiration)
    const { token, hashed, expires } = createSecureToken(24);

    // Store verification token
    await db.insert(verificationTokens).values({
      identifier: user[0].email,
      token: hashed,
      expires,
    });

    // Send verification email
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${token}`;

    try {
      await sendTemplate("email-verification", {
        to: user[0].email,
        subject: "Verify Your Email Address",
        data: {
          userName: user[0].name ?? user[0].email,
          verifyUrl,
          expiryHours: 24,
        },
      });
      console.log(`[Auth] Verification email sent to: ${user[0].email}`);
    } catch (emailError) {
      console.error("[Auth] Failed to send verification email:", emailError);
    }

    // Send welcome email
    await sendTemplate("welcome", {
      to: user[0].email,
      subject: "Welcome to Pisky!",
      data: {
        userName: user[0].name || "there",
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
      },
    }).catch((error) => {
      console.error("[Auth] Failed to send welcome email:", error);
    });

    console.log(`[Auth] New user registered: ${user[0].email} (${user[0].id})`);

    return NextResponse.json(
      {
        message: "Registration successful. Please check your email to verify your account.",
        requireEmailVerification: true,
        userId: user[0].id,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle validation errors
    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Validation Error",
          details: "errors" in error ? error.errors : undefined,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    const message = error instanceof Error ? error.message : "Registration failed";
    console.error("[Auth] Registration error:", error);
    return NextResponse.json(
      {
        error: "Server Error",
        message,
      },
      { status: 500 }
    );
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add app/api/auth/register/
git commit -m "feat: add registration API endpoint

- Validate input with Zod schema
- Assign default user role to new users
- Hash password with bcrypt
- Generate email verification token (24hr expiry)
- Send verification and welcome emails (mock)
- Generic error messages to prevent email enumeration

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Create Forgot Password API Route

**Files:**

- Create: `app/api/auth/forgot-password/route.ts`

Create API endpoint for password reset requests.

- [ ] **Step 1: Create forgot password API**

Create `app/api/auth/forgot-password/route.ts`:

```typescript
import { getDatabase } from "@/config/database";
import { sendTemplate } from "@/lib/email";
import { createSecureToken } from "@/lib/tokens";
import { forgotPasswordSchema } from "@/features/auth/validations/auth";
import { users } from "@/features/database/models/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/forgot-password
 * Initiates password reset flow
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = forgotPasswordSchema.parse(body);

    const db = getDatabase();

    // Find user by email
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    const user = userResult[0];

    // Always return success, even if user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists with that email, a password reset link has been sent.",
        },
        { status: 200 }
      );
    }

    // Generate secure reset token (1 hour expiration)
    const { token, hashed, expires } = createSecureToken(1);

    // Store token in database
    await db
      .update(users)
      .set({
        passwordResetToken: hashed,
        passwordResetExpires: expires,
      })
      .where(eq(users.id, user.id));

    // Generate reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    // Send reset email
    const result = await sendTemplate("password-reset", {
      to: user.email,
      subject: "Reset Your Password",
      data: {
        userName: user.name ?? user.email?.split("@")[0] ?? "User",
        resetUrl,
        expiryHours: 1,
      },
    });

    if (!result.success) {
      console.error("Failed to send password reset email:", result.error);
    }

    return NextResponse.json(
      {
        success: true,
        message: "If an account exists with that email, a password reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation Error", message: "Invalid email format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to process request" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/auth/forgot-password/
git commit -m "feat: add forgot password API endpoint

- Validate email with Zod
- Generate secure reset token (1hr expiry)
- Store hashed token in database
- Send password reset email
- Always return success to prevent email enumeration

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 12: Create Reset Password API Route

**Files:**

- Create: `app/api/auth/reset-password/route.ts`

Create API endpoint for password reset with token.

- [ ] **Step 1: Create reset password API**

Create `app/api/auth/reset-password/route.ts`:

```typescript
import { getDatabase } from "@/config/database";
import { sendTemplate } from "@/lib/email";
import { hashToken, isTokenExpired } from "@/lib/tokens";
import { resetPasswordSchema } from "@/features/auth/validations/auth";
import { users } from "@/features/database/models/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/reset-password
 * Resets user password with valid token
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = resetPasswordSchema.parse(body);

    const { token } = body as { token: string };
    const { password } = validatedData;

    if (!token) {
      return NextResponse.json(
        { error: "Bad Request", message: "Reset token is required" },
        { status: 400 }
      );
    }

    // Hash the token to match with stored token
    const hashedToken = hashToken(token);

    const db = getDatabase();

    // Find user with valid reset token
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, hashedToken))
      .limit(1);

    const user = userResult[0];

    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid Token",
          message: "Invalid or expired reset token. Please request a new password reset.",
        },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (isTokenExpired(user.passwordResetExpires)) {
      // Clear expired token
      await db
        .update(users)
        .set({
          passwordResetToken: null,
          passwordResetExpires: null,
        })
        .where(eq(users.id, user.id));

      return NextResponse.json(
        {
          error: "Expired Token",
          message: "Reset token has expired. Please request a new password reset.",
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    await db
      .update(users)
      .set({
        passwordHash: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      })
      .where(eq(users.id, user.id));

    // Send confirmation email
    await sendTemplate("password-reset-confirm", {
      to: user.email,
      subject: "Password Successfully Reset",
      data: {
        userName: user.name ?? user.email?.split("@")[0] ?? "User",
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successfully. You can now log in with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation Error", message: "Invalid input data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to reset password" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/auth/reset-password/
git commit -m "feat: add reset password API endpoint

- Validate token and new password
- Verify token hasn't expired
- Hash new password with bcrypt
- Clear reset token after use
- Send confirmation email

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 13: Create Email Verification API Route

**Files:**

- Create: `app/api/auth/verify-email/route.ts`

Create API endpoint for email verification.

- [ ] **Step 1: Create email verification API**

Create `app/api/auth/verify-email/route.ts`:

```typescript
import { getDatabase } from "@/config/database";
import { hashToken, isTokenExpired } from "@/lib/tokens";
import { users, verificationTokens } from "@/features/database/models/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/verify-email
 * Verify user email with token
 */
export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Invalid token",
        },
        { status: 400 }
      );
    }

    // Hash the token to compare with stored hash
    const hashedToken = hashToken(token);

    const db = getDatabase();

    // Find the verification token
    const vTokenResult = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, hashedToken))
      .limit(1);

    const vToken = vTokenResult[0];

    if (!vToken) {
      return NextResponse.json(
        {
          error: "Invalid Token",
          message: "The verification token is invalid or has already been used",
        },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (isTokenExpired(vToken.expires)) {
      // Delete expired token
      await db.delete(verificationTokens).where(eq(verificationTokens.token, hashedToken));

      return NextResponse.json(
        {
          error: "Expired Token",
          message: "The verification token has expired. Please request a new one",
        },
        { status: 400 }
      );
    }

    // Find user by email (identifier)
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, vToken.identifier))
      .limit(1);

    const user = userResult[0];

    if (!user) {
      return NextResponse.json(
        {
          error: "User Not Found",
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      // Delete the token anyway
      await db.delete(verificationTokens).where(eq(verificationTokens.token, hashedToken));

      return NextResponse.json(
        {
          message: "Email already verified",
          alreadyVerified: true,
        },
        { status: 200 }
      );
    }

    // Update user's emailVerified field
    await db
      .update(users)
      .set({
        emailVerified: new Date(),
      })
      .where(eq(users.id, user.id));

    // Delete the verification token (one-time use)
    await db.delete(verificationTokens).where(eq(verificationTokens.token, hashedToken));

    console.log(`[Auth] Email verified successfully: ${user.email} (${user.id})`);

    return NextResponse.json(
      {
        message: "Email verified successfully",
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email verification failed";
    console.error("[Auth] Email verification error:", error);
    return NextResponse.json(
      {
        error: "Server Error",
        message,
      },
      { status: 500 }
    );
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add app/api/auth/verify-email/
git commit -m "feat: add email verification API endpoint

- Validate verification token
- Check token expiration
- Mark user email as verified
- Delete token after use (one-time)
- Handle already verified case

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 14: Create Password Input Component

**Files:**

- Create: `components/auth/password-input.tsx`

Create reusable password input component with show/hide toggle.

- [ ] **Step 1: Create password input component**

Create `components/auth/password-input.tsx`:

```typescript
"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface PasswordInputProps {
  id: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  registration?: ReturnType<typeof import("react-hook-form").useRegister>;
}

export function PasswordInput({
  id,
  label,
  placeholder = "Enter password",
  disabled = false,
  error,
  registration,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" strokeWidth={1.5} />
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10 h-11 rounded-xl bg-background border-muted/80 shadow-none focus-visible:ring-1 focus-visible:ring-primary"
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground focus:outline-none transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" strokeWidth={1.5} />
          ) : (
            <Eye className="h-5 w-5" strokeWidth={1.5} />
          )}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/auth/password-input.tsx
git commit -m "feat: add password input component

- Show/hide password toggle
- Lock icon
- Error message display
- Reusable for login, register, reset password forms

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 15: Create Login Form Component

**Files:**

- Create: `components/auth/login-form.tsx`

Create login form component with credentials authentication.

- [ ] **Step 1: Create login form**

Create `components/auth/login-form.tsx`:

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/auth/password-input";
import { loginSchema, type LoginInput } from "@/features/auth/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, ArrowRight } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        // Redirect to callback URL or dashboard
        router.push(callbackUrl || "/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" strokeWidth={1.5} />
          <Input
            id="email"
            {...form.register("email")}
            type="email"
            placeholder="Enter your email"
            disabled={isLoading}
            className="pl-10 h-11 rounded-xl bg-background border-muted/80 shadow-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
        )}
      </div>

      <PasswordInput
        id="password"
        label="Password"
        placeholder="Enter your password"
        disabled={isLoading}
        error={form.formState.errors.password?.message}
        registration={form.register("password")}
      />

      <div className="flex items-center justify-between text-sm py-1">
        <div className="flex items-center gap-2">
          <Checkbox id="remember" className="rounded-sm w-4 h-4" />
          <label htmlFor="remember" className="text-muted-foreground cursor-pointer select-none">
            Remember me
          </label>
        </div>
        <Link href="/forgot-password" className="text-primary hover:text-primary/80 font-medium transition-colors">
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-colors"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="pt-2 text-center text-sm">
        <span className="text-muted-foreground mr-1">Don't have an account?</span>
        <Link
          href="/register"
          className="inline-flex items-center text-primary hover:text-primary/80 font-semibold transition-colors"
        >
          Sign up <ArrowRight className="ml-1 w-4 h-4" />
        </Link>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/auth/login-form.tsx
git commit -m "feat: add login form component

- Email and password inputs with validation
- Remember me checkbox
- Forgot password link
- Error handling and loading states
- Redirect to callback URL after login
- Sign up link

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 16: Create Register Form Component

**Files:**

- Create: `components/auth/register-form.tsx`

Create registration form component with password strength indicator.

- [ ] **Step 1: Create register form**

Create `components/auth/register-form.tsx`:

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PasswordInput } from "@/components/auth/password-input";
import { registerSchema, type RegisterInput } from "@/features/auth/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User, ArrowLeft, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = form.watch("password");

  // Password strength calculator
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: "Weak", color: "bg-red-500" };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 25, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { score: 50, label: "Fair", color: "bg-yellow-500" };
    if (score <= 3) return { score: 75, label: "Good", color: "bg-blue-500" };
    return { score: 100, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(passwordValue || "");

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      setRegistrationSuccess(true);
    } catch (error) {
      console.error("Registration failed:", error);
      form.setError("root", {
        message: error instanceof Error ? error.message : "Registration failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message if registration completed
  if (registrationSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 mb-2">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">Registration Successful!</h3>
          <p className="text-sm text-muted-foreground">
            We've sent a verification email to your address. Please check your email to activate your account.
          </p>
        </div>

        <div className="space-y-4 w-full pt-4">
          <Button
            asChild
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-colors"
          >
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {form.formState.errors.root && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {form.formState.errors.root.message}
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-foreground">
          Full Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" strokeWidth={1.5} />
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            disabled={isLoading}
            {...form.register("name")}
            className="pl-10 h-11 rounded-xl bg-background border-muted/80 shadow-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" strokeWidth={1.5} />
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={isLoading}
            {...form.register("email")}
            className="pl-10 h-11 rounded-xl bg-background border-muted/80 shadow-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <PasswordInput
        id="password"
        label="Password"
        placeholder="Minimum 8 characters"
        disabled={isLoading}
        error={form.formState.errors.password?.message}
        registration={form.register("password")}
      />

      {/* Password Strength Indicator */}
      {passwordValue && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Password strength:</span>
            <span
              className={`font-medium ${
                passwordStrength.score === 25
                  ? "text-red-500"
                  : passwordStrength.score === 50
                    ? "text-yellow-500"
                    : passwordStrength.score === 75
                      ? "text-blue-500"
                      : "text-green-500"
              }`}
            >
              {passwordStrength.label}
            </span>
          </div>
          <Progress value={passwordStrength.score} className="h-1.5 rounded-full" />
        </div>
      )}

      {/* Confirm Password */}
      <div className="space-y-2 pb-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
          Confirm Password
        </Label>
        <div className="relative">
          <Eye className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" strokeWidth={1.5} />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            disabled={isLoading}
            {...form.register("confirmPassword")}
            className="pl-10 pr-10 h-11 rounded-xl bg-background border-muted/80 shadow-none focus-visible:ring-1 focus-visible:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground focus:outline-none transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Eye className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-colors"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>

      {/* Login Link */}
      <p className="text-center text-sm pt-2">
        <span className="text-muted-foreground mr-1">Already have an account?</span>
        <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
          Sign in <ArrowRight className="inline-block ml-0.5 mb-0.5 w-3.5 h-3.5" />
        </Link>
      </p>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/auth/register-form.tsx
git commit -m "feat: add registration form component

- Name, email, password, confirm password fields
- Password strength indicator with visual progress bar
- Show/hide password toggles
- Form validation with error messages
- Success state after registration
- Link to login page

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 17: Create Auth Pages

**Files:**

- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/register/page.tsx`
- Create: `app/(auth)/forgot-password/page.tsx`
- Create: `app/(auth)/reset-password/page.tsx`
- Create: `app/(auth)/verify-email/page.tsx`

Create all authentication pages.

- [ ] **Step 1: Create login page**

Create `app/(auth)/login/page.tsx`:

```typescript
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign In - Pisky",
  description: "Sign in to your account",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account to continue</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create register page**

Create `app/(auth)/register/page.tsx`:

```typescript
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Sign Up - Pisky",
  description: "Create a new account",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create an account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Get started with your free account today</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create forgot password page**

Create `app/(auth)/forgot-password/page.tsx`:

```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const metadata = {
  title: "Forgot Password - Pisky",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send reset email");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Check your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We've sent a password reset link to your email address.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center space-y-6">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Forgot password?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we'll send you a reset link
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" strokeWidth={1.5} />
                <Input
                  id="email"
                  {...form.register("email")}
                  type="email"
                  placeholder="Enter your email"
                  disabled={isLoading}
                  className="pl-10 h-11 rounded-xl bg-background border-muted/80 shadow-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center text-sm">
              <Link href="/login" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create reset password page**

Create `app/(auth)/reset-password/page.tsx`:

```typescript
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/password-input";
import { resetPasswordSchema, type ResetPasswordInput } from "@/features/auth/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const metadata = {
  title: "Reset Password - Pisky",
  description: "Reset your password",
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to reset password");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center space-y-6">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">Invalid Reset Link</h1>
              <p className="text-sm text-muted-foreground">
                This password reset link is invalid. Please request a new one.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/forgot-password">Request New Link</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center space-y-6">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">Password Reset Successful</h1>
              <p className="text-sm text-muted-foreground">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Reset Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your new password below</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            <PasswordInput
              id="password"
              label="New Password"
              placeholder="Minimum 8 characters"
              disabled={isLoading}
              error={form.formState.errors.password?.message}
              registration={form.register("password")}
            />

            <PasswordInput
              id="confirmPassword"
              label="Confirm New Password"
              placeholder="Re-enter your password"
              disabled={isLoading}
              error={form.formState.errors.confirmPassword?.message}
              registration={form.register("confirmPassword")}
            />

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>

            <div className="text-center text-sm">
              <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create verify email page**

Create `app/(auth)/verify-email/page.tsx`:

```typescript
import { Button } from "@/components/ui/button";
import { verifyEmailSchema } from "@/features/auth/validations/auth";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export const metadata = {
  title: "Verify Email - Pisky",
  description: "Verify your email address",
};

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(!!token);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setError("Invalid verification link");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Verification failed");
        }

        if (result.alreadyVerified) {
          setIsAlreadyVerified(true);
        }

        setIsSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center space-y-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">Verifying your email...</h1>
              <p className="text-sm text-muted-foreground">Please wait while we verify your email address.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess || isAlreadyVerified) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center space-y-6">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">
                {isAlreadyVerified ? "Email Already Verified" : "Email Verified Successfully"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isAlreadyVerified
                  ? "Your email has already been verified. You can now log in to your account."
                  : "Your email has been verified successfully. You can now log in to your account."}
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">Verification Failed</h1>
            <p className="text-sm text-muted-foreground">{error || "Invalid or expired verification link"}</p>
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/register">Back to Register</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add app/\(auth\)/
git commit -m "feat: add auth pages

- Login page with login form
- Register page with registration form
- Forgot password page
- Reset password page with token validation
- Email verification page
- Consistent layout and styling
- Success and error states

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 18: Update Middleware for RBAC

**Files:**

- Modify: `middleware.ts`

Update middleware to work with new auth routes and RBAC.

- [ ] **Step 1: Replace middleware**

Replace the entire content of `middleware.ts` with:

```typescript
import { auth } from "@/config/auth";
import { NextResponse } from "next/server";

/**
 * Role-based route protection in middleware
 * Provides quick role checks for known protected routes.
 */

// Manage routes - requires ADMIN role
const MANAGE_ROUTES = ["/manage"];

// Routes that require authentication (any role)
const PROTECTED_ROUTES = ["/dashboard", "/settings"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;

  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isManageRoute = MANAGE_ROUTES.some((route) => pathname.startsWith(route));

  // Auth pages (redirect authenticated users away)
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email");

  // Redirect unauthenticated users trying to access protected routes
  if ((isProtectedRoute || isManageRoute) && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Check manage routes - requires ADMIN role
  if (isManageRoute && isLoggedIn) {
    const userRoleName = req.auth?.user?.role?.name;

    if (!userRoleName || userRoleName !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.svg|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.ico).*)",
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: update middleware for RBAC

- Protect /dashboard and /settings routes
- Admin role required for /manage routes
- Redirect unauthenticated users to login
- Redirect authenticated users away from auth pages
- Support callbackUrl parameter

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 19: Remove Old Sign-In Page and OAuth Components

**Files:**

- Delete: `app/(auth)/sign-in/page.tsx`
- Delete: `features/auth/components/oauth-buttons.tsx`
- Delete: `features/auth/components/sign-in-form.tsx`

Remove old OAuth-based auth components.

- [ ] **Step 1: Delete old files**

```bash
rm -f app/\(auth\)/sign-in/page.tsx
rm -f features/auth/components/oauth-buttons.tsx
rm -f features/auth/components/sign-in-form.tsx
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove old OAuth-based auth components

- Remove sign-in page (replaced by login)
- Remove OAuth buttons component
- Remove old sign-in form component

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 20: Create Unauthorized Page

**Files:**

- Create: `app/unauthorized/page.tsx`

Create a page for unauthorized access attempts.

- [ ] **Step 1: Create unauthorized page**

Create `app/unauthorized/page.tsx`:

```typescript
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Unauthorized - Pisky",
  description: "You don't have permission to access this page",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
              <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">Access Denied</h1>
            <p className="text-sm text-muted-foreground">
              You don't have permission to access this page. Please contact your administrator if you believe this is an error.
            </p>
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/unauthorized/
git commit -m "feat: add unauthorized page

- Displayed when user lacks required permissions
- Clear messaging about access denial
- Links to dashboard and login

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 21: Final Testing and Verification

**Files:**

- Multiple (verification)

Run comprehensive tests to ensure everything works correctly.

- [ ] **Step 1: Test database migration**

Run: `pnpm db:push`
Expected: All tables and columns created successfully

- [ ] **Step 2: Run seed data**

Run: `pnpm db:seed`
Expected: Roles, permissions, and admin user created

- [ ] **Step 3: Test registration flow**

1. Navigate to `/register`
2. Fill out the form with valid data
3. Submit the form
4. Check console for mock email output
5. Verify success message is displayed

- [ ] **Step 4: Test email verification**

1. Copy the verification token from console log
2. Navigate to `/verify-email?token=<token>`
3. Verify success message appears

- [ ] **Step 5: Test login flow**

1. Navigate to `/login`
2. Use the seeded admin credentials (admin@pisky.com / admin123)
3. Verify successful login redirects to `/dashboard`

- [ ] **Step 6: Test forgot password**

1. Navigate to `/forgot-password`
2. Enter an email address
3. Check console for mock email with reset token
4. Verify success message appears

- [ ] **Step 7: Test password reset**

1. Copy the reset token from console log
2. Navigate to `/reset-password?token=<token>`
3. Enter new password
4. Verify success message appears
5. Test login with new password

- [ ] **Step 8: Test protected routes**

1. Log out
2. Try to access `/dashboard` - should redirect to `/login`
3. Log in as admin
4. Access `/dashboard` - should work
5. Log in as regular user (create one via registration)
6. Try to access `/manage` - should redirect to `/unauthorized`

- [ ] **Step 9: Test RBAC permissions**

1. Check that session includes role and permissions
2. Verify `useCan()` hook works in client components
3. Verify `requirePermission()` works in API routes

- [ ] **Step 10: Final commit**

```bash
git add -A
git commit -m "chore: final testing and verification complete

- All auth flows tested and working
- Database migration successful
- Seed data created correctly
- Protected routes functioning
- RBAC permissions enforced

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Summary

This implementation plan creates a complete authentication system for Pisky with:

1. **RBAC Database Schema** - roles, permissions, role_permissions tables
2. **Seed Data** - default admin/user roles with 33 permissions
3. **Token Utilities** - secure token generation and validation
4. **Mock Email Service** - console-based email logging for development
5. **Validation Schemas** - Zod schemas for all auth forms
6. **RBAC System** - types, checker, server helpers, and client hooks
7. **NextAuth Configuration** - credentials only, with role/permission loading
8. **API Routes** - register, forgot-password, reset-password, verify-email
9. **UI Components** - password input, login form, register form
10. **Auth Pages** - login, register, forgot-password, reset-password, verify-email
11. **Middleware** - route protection with RBAC
12. **Unauthorized Page** - for access denied scenarios

**Default Admin Credentials:**

- Email: admin@pisky.com
- Password: admin123
