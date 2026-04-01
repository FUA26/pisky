# Admin User Management & Profile System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build comprehensive admin panel for user/role/permission management with enhanced RBAC (role inheritance) plus user profile/security settings.

**Architecture:** Monolithic Next.js app with feature-based organization. Admin routes protected by enhanced RBAC with role inheritance and audit logging. User settings for profile and security management.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Shadcn UI, PostgreSQL, Drizzle ORM, React Query, React Hook Form, Zod, Vitest, Playwright

---

## File Structure

### New Files to Create

```
features/admin/
├── users/
│   ├── api.ts                    # User CRUD functions
│   ├── hooks.ts                  # React hooks for user operations
│   └── validations.ts            # Zod schemas for user operations
├── roles/
│   ├── api.ts                    # Role CRUD functions
│   ├── hooks.ts                  # React hooks for role operations
│   ├── inheritance.ts            # Role inheritance logic
│   └── validations.ts            # Zod schemas for role operations
├── audit-logs/
│   ├── api.ts                    # Audit log query functions
│   └── service.ts                # Audit logging service
└── permissions/
    └── inheritance.ts            # Enhanced permission checking with inheritance

features/profile/
├── api.ts                        # Profile CRUD functions
├── hooks.ts                      # React hooks for profile operations
└── validations.ts                # Zod schemas for profile operations

features/security/
├── api.ts                        # Security functions (password, sessions)
├── hooks.ts                      # React hooks for security operations
└── validations.ts                # Zod schemas for security operations

components/admin/
├── data-table.tsx                # Reusable data table component
├── bulk-actions-bar.tsx          # Bulk operations UI
├── user-form.tsx                 # User create/edit form
├── role-form.tsx                 # Role create/edit form
├── permission-tree.tsx           # Permission checkbox tree
├── audit-log-timeline.tsx        # Timeline visualization
└── role-hierarchy-tree.tsx       # Role inheritance tree

components/profile/
├── profile-form.tsx              # Profile editing form
├── password-change-form.tsx      # Password change form
└── session-list.tsx              # Active sessions list

app/admin/
├── layout.tsx                    # Admin layout with sidebar
├── page.tsx                      # Admin dashboard
├── users/
│   ├── page.tsx                  # User list
│   ├── new/page.tsx              # Create user
│   └── [id]/
│       ├── page.tsx              # User detail/edit
│       └── activity/page.tsx     # User activity log
├── roles/
│   ├── page.tsx                  # Role list
│   ├── new/page.tsx              # Create role
│   └── [id]/
│       ├── page.tsx              # Role detail/edit
│       └── users/page.tsx        # Users with this role
├── permissions/
│   └── page.tsx                  # Permission library
└── audit-logs/
    └── page.tsx                  # Audit logs

app/settings/
├── layout.tsx                    # Settings layout with tabs
├── profile/
│   └── page.tsx                  # Profile editing
└── security/
    └── page.tsx                  # Security settings

app/api/admin/
├── users/
│   ├── route.ts                  # List, create users
│   ├── [id]/route.ts             # Get, update, delete user
│   └── bulk/route.ts             # Bulk operations
├── roles/
│   ├── route.ts                  # List, create roles
│   └── [id]/route.ts             # Get, update, delete role
├── permissions/
│   └── route.ts                  # List permissions
└── audit-logs/
    └── route.ts                  # List audit logs

app/api/settings/
├── profile/
│   └── route.ts                  # Get, update profile
├── avatar/
│   └── route.ts                  # Upload avatar
└── security/
    ├── password/route.ts         # Change password
    └── sessions/
        ├── route.ts              # List sessions
        └── [id]/route.ts         # Revoke session

tests/
├── unit/
│   ├── role-inheritance.test.ts
│   ├── audit-logging.test.ts
│   └── permission-cache.test.ts
├── integration/
│   ├── admin-api.test.ts
│   └── settings-api.test.ts
└── e2e/
    ├── admin-users.spec.ts
    ├── admin-roles.spec.ts
    └── user-settings.spec.ts
```

### Files to Modify

```
features/database/models/schema.ts    # Add new tables
features/auth/permissions/permissions.ts  # Enhance with inheritance
features/auth/permissions/rbac-checker.ts # Update for inheritance
```

---

## Task 1: Database Schema Updates

**Files:**

- Modify: `features/database/models/schema.ts`

- [ ] **Step 1: Add role inheritance to roles table**

Add `parentRoleId` column to roles table:

```typescript
export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  parentRoleId: uuid("parentRoleId").references(() => roles.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
```

- [ ] **Step 2: Add audit_logs table**

```typescript
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: uuid("entityId"),
  oldData: jsonb("oldData"),
  newData: jsonb("newData"),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
```

- [ ] **Step 3: Add user_profiles table**

```typescript
export const userProfiles = pgTable("user_profiles", {
  userId: uuid("userId")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  preferences: jsonb("preferences").$type<{ theme?: string; language?: string }>().default("{}"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
```

- [ ] **Step 4: Add user_sessions table**

```typescript
export const userSessions = pgTable("user_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id),
  token: varchar("token", { length: 255 }).notNull().unique(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  lastActive: timestamp("lastActive").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});
```

- [ ] **Step 5: Export new types**

Add at end of schema.ts:

```typescript
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type RoleWithParent = typeof roles.$inferSelect & { parentRole?: Role };
```

- [ ] **Step 6: Generate and run migration**

```bash
pnpm db:generate
pnpm db:push
```

Expected: Migration SQL generated, database schema updated successfully

- [ ] **Step 7: Commit**

```bash
git add features/database/models/schema.ts
git add features/database/migrations/
git commit -m "feat: add database schema for admin features

- Add parentRoleId to roles for inheritance
- Add audit_logs table
- Add user_profiles table
- Add user_sessions table
"
```

---

## Task 2: Role Inheritance Logic

**Files:**

- Create: `features/admin/roles/inheritance.ts`
- Create: `tests/unit/role-inheritance.test.ts`

- [ ] **Step 1: Write test for role inheritance**

Create `tests/unit/role-inheritance.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import {
  getAllPermissionsForRole,
  detectCircularInheritance,
} from "@/features/admin/roles/inheritance";

describe("Role Inheritance", () => {
  it("should get direct permissions for role without parent", async () => {
    const permissions = await getAllPermissionsForRole("role-without-parent");
    expect(permissions).toContain("users:read");
  });

  it("should inherit permissions from parent role", async () => {
    const childRoleId = "child-role-id";
    const permissions = await getAllPermissionsForRole(childRoleId);
    expect(permissions).toContain("users:read"); // from parent
    expect(permissions).toContain("content:edit"); // direct
  });

  it("should handle multi-level inheritance", async () => {
    const permissions = await getAllPermissionsForRole("grandchild-role-id");
    expect(permissions).toContain("users:read"); // from grandparent
    expect(permissions).toContain("content:edit"); // from parent
    expect(permissions).toContain("content:delete"); // direct
  });

  it("should detect circular inheritance", async () => {
    const result = await detectCircularInheritance("role-a", "role-b");
    expect(result).toBe(true);
  });

  it("should allow valid inheritance chain", async () => {
    const result = await detectCircularInheritance("role-child", "role-parent");
    expect(result).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/unit/role-inheritance.test.ts
```

Expected: FAIL - "Cannot find module '@/features/admin/roles/inheritance'"

- [ ] **Step 3: Implement role inheritance logic**

Create `features/admin/roles/inheritance.ts`:

```typescript
import { db } from "@/config/database";
import { roles, rolePermissions, permissions } from "@/features/database/models/schema";
import { eq, and } from "drizzle-orm";
import type { Permission } from "@/features/auth/permissions/rbac-types";

/**
 * Get all permissions for a role including inherited permissions
 * Recursively walks up the role hierarchy
 */
export async function getAllPermissionsForRole(roleId: string): Promise<Permission[]> {
  // Get role details
  const roleResult = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);

  if (!roleResult[0]) {
    return [];
  }

  const role = roleResult[0];

  // Get direct permissions for this role
  const directPerms = await db
    .select({
      name: permissions.name,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, roleId));

  let permissionList: Permission[] = directPerms.map((p) => p.name as Permission);

  // If role has parent, recursively get parent's permissions
  if (role.parentRoleId) {
    const parentPerms = await getAllPermissionsForRole(role.parentRoleId);
    permissionList = [...permissionList, ...parentPerms];
  }

  // Remove duplicates and return
  return Array.from(new Set(permissionList));
}

/**
 * Detect if setting parentRoleId would create circular inheritance
 * @param roleId - The role being updated
 * @param parentRoleId - The proposed parent role ID
 */
export async function detectCircularInheritance(
  roleId: string,
  parentRoleId: string
): Promise<boolean> {
  // Can't be your own parent
  if (roleId === parentRoleId) {
    return true;
  }

  // Walk up the parent chain from parentRoleId
  let currentRoleId = parentRoleId;
  const visited = new Set<string>([roleId, parentRoleId]);

  while (currentRoleId) {
    const parentRoleResult = await db
      .select({ parentRoleId: roles.parentRoleId })
      .from(roles)
      .where(eq(roles.id, currentRoleId))
      .limit(1);

    const parentRole = parentRoleResult[0];

    if (!parentRole?.parentRoleId) {
      // Reached top of hierarchy
      return false;
    }

    // Check if we've seen this role before (cycle detected)
    if (visited.has(parentRole.parentRoleId)) {
      return true;
    }

    visited.add(parentRole.parentRoleId);
    currentRoleId = parentRole.parentRoleId;
  }

  return false;
}

/**
 * Get all descendants of a role (for hierarchy display)
 */
export async function getRoleDescendants(roleId: string): Promise<string[]> {
  const children = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.parentRoleId, roleId));

  const descendants: string[] = [];

  for (const child of children) {
    descendants.push(child.id);
    const childDescendants = await getRoleDescendants(child.id);
    descendants.push(...childDescendants);
  }

  return descendants;
}

/**
 * Get role hierarchy tree for display
 */
export async function getRoleHierarchy(): Promise<RoleHierarchyNode[]> {
  const allRoles = await db.select().from(roles);

  // Build role map
  const roleMap = new Map<string, (typeof allRoles)[0] & { children: RoleHierarchyNode[] }>();
  for (const role of allRoles) {
    roleMap.set(role.id, { ...role, children: [] });
  }

  // Build tree
  const rootRoles: RoleHierarchyNode[] = [];
  for (const role of allRoles) {
    const node = roleMap.get(role.id)!;
    if (role.parentRoleId) {
      const parent = roleMap.get(role.parentRoleId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      rootRoles.push(node);
    }
  }

  return rootRoles;
}

type RoleHierarchyNode = {
  id: string;
  name: string;
  description: string | null;
  parentRoleId: string | null;
  children: RoleHierarchyNode[];
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/unit/role-inheritance.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add features/admin/roles/inheritance.ts
git add tests/unit/role-inheritance.test.ts
git commit -m "feat: implement role inheritance logic

- Add getAllPermissionsForRole with recursive permission resolution
- Add detectCircularInheritance to prevent cycles
- Add getRoleDescendants for hierarchy operations
- Add getRoleHierarchy for tree display
- Add unit tests
"
```

---

## Task 3: Audit Logging Service

**Files:**

- Create: `features/admin/audit-logs/service.ts`
- Create: `features/admin/audit-logs/api.ts`
- Create: `tests/unit/audit-logging.test.ts`

- [ ] **Step 1: Write test for audit logging**

Create `tests/unit/audit-logging.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { logAction, getAuditLogs } from "@/features/admin/audit-logs/service";

describe("Audit Logging", () => {
  it("should log user creation", async () => {
    await logAction({
      userId: "user-id",
      action: "user.created",
      entityType: "user",
      entityId: "new-user-id",
      newData: { name: "John", email: "john@example.com" },
      ipAddress: "127.0.0.1",
      userAgent: "test-agent",
    });

    const logs = await getAuditLogs({ entityType: "user" });
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe("user.created");
  });

  it("should log user update with old and new data", async () => {
    await logAction({
      userId: "user-id",
      action: "user.updated",
      entityType: "user",
      entityId: "user-id",
      oldData: { name: "John" },
      newData: { name: "John Doe" },
    });

    const logs = await getAuditLogs({ entityId: "user-id" });
    expect(logs[0].oldData).toEqual({ name: "John" });
    expect(logs[0].newData).toEqual({ name: "John Doe" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/unit/audit-logging.test.ts
```

Expected: FAIL - "Cannot find module '@/features/admin/audit-logs/service'"

- [ ] **Step 3: Implement audit logging service**

Create `features/admin/audit-logs/service.ts`:

```typescript
import { db } from "@/config/database";
import { auditLogs } from "@/features/database/models/schema";
import type { NewAuditLog } from "@/features/database/models/schema";

export interface AuditLogParams {
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an action to the audit trail
 */
export async function logAction(params: AuditLogParams): Promise<void> {
  const logEntry: NewAuditLog = {
    userId: params.userId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    oldData: params.oldData,
    newData: params.newData,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  };

  await db.insert(auditLogs).values(logEntry);
}

/**
 * Extract IP address from request
 */
export function extractIpAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Extract user agent from request
 */
export function extractUserAgent(request: Request): string {
  return request.headers.get("user-agent") || "unknown";
}
```

- [ ] **Step 4: Implement audit log query functions**

Create `features/admin/audit-logs/api.ts`:

```typescript
import { db } from "@/config/database";
import { auditLogs, users } from "@/features/database/models/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import type { AuditLog } from "@/features/database/models/schema";

export interface AuditLogFilters {
  startDate?: Date;
  endDate?: Date;
  action?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogResult {
  logs: Array<AuditLog & { userName: string }>;
  total: number;
  page: number;
  limit: number;
}

/**
 * Query audit logs with filters and pagination
 */
export async function getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogResult> {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const offset = (page - 1) * limit;

  // Build conditions
  const conditions = [];

  if (filters.startDate) {
    conditions.push(gte(auditLogs.timestamp, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(auditLogs.timestamp, filters.endDate));
  }
  if (filters.action) {
    conditions.push(eq(auditLogs.action, filters.action));
  }
  if (filters.entityType) {
    conditions.push(eq(auditLogs.entityType, filters.entityType));
  }
  if (filters.entityId) {
    conditions.push(eq(auditLogs.entityId, filters.entityId));
  }
  if (filters.userId) {
    conditions.push(eq(auditLogs.userId, filters.userId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(auditLogs)
    .where(whereClause);

  const total = countResult[0]?.count || 0;

  // Get logs with user info
  const logs = await db
    .select({
      id: auditLogs.id,
      userId: auditLogs.userId,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      oldData: auditLogs.oldData,
      newData: auditLogs.newData,
      ipAddress: auditLogs.ipAddress,
      userAgent: auditLogs.userAgent,
      timestamp: auditLogs.timestamp,
      userName: users.name,
    })
    .from(auditLogs)
    .innerJoin(users, eq(auditLogs.userId, users.id))
    .where(whereClause)
    .orderBy(desc(auditLogs.timestamp))
    .limit(limit)
    .offset(offset);

  return {
    logs,
    total,
    page,
    limit,
  };
}

/**
 * Get audit logs for a specific entity
 */
export async function getEntityAuditLogs(
  entityType: string,
  entityId: string
): Promise<Array<AuditLog & { userName: string }>> {
  const logs = await db
    .select({
      id: auditLogs.id,
      userId: auditLogs.userId,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      oldData: auditLogs.oldData,
      newData: auditLogs.newData,
      ipAddress: auditLogs.ipAddress,
      userAgent: auditLogs.userAgent,
      timestamp: auditLogs.timestamp,
      userName: users.name,
    })
    .from(auditLogs)
    .innerJoin(users, eq(auditLogs.userId, users.id))
    .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
    .orderBy(desc(auditLogs.timestamp));

  return logs;
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pnpm test tests/unit/audit-logging.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add features/admin/audit-logs/
git add tests/unit/audit-logging.test.ts
git commit -m "feat: implement audit logging service

- Add logAction function for recording events
- Add getAuditLogs with filters and pagination
- Add getEntityAuditLogs for specific entities
- Add helper functions for IP/user agent extraction
- Add unit tests
"
```

---

## Task 4: Enhanced Permission Checking with Inheritance

**Files:**

- Create: `features/admin/permissions/inheritance.ts`
- Modify: `features/auth/permissions/permissions.ts`

- [ ] **Step 1: Update permissions.ts to use inheritance**

Modify `features/auth/permissions/permissions.ts`. Replace the existing `loadUserPermissions` function:

```typescript
import { getAllPermissionsForRole } from "@/features/admin/roles/inheritance";

// ... keep existing imports and cache ...

/**
 * Load user permissions from database with caching and inheritance
 */
async function loadUserPermissions(userId: string): Promise<UserPermissionsContext> {
  // Check cache first
  const cached = permissionCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.context;
  }

  const db = getDatabase();

  if (!db) {
    throw new Error("Database not available");
  }

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

  // Get permissions for this role (including inherited)
  const permissionList = userWithRole.role
    ? await getAllPermissionsForRole(userWithRole.role.id)
    : [];

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
```

- [ ] **Step 2: Add cache invalidation helper**

Add to `features/auth/permissions/permissions.ts`:

```typescript
/**
 * Clear permission cache for all users with a specific role
 * Call this when role permissions are updated
 */
export async function clearPermissionCacheForRole(roleId: string): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  const usersWithRole = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.roleId, roleId));

  for (const user of usersWithRole) {
    permissionCache.delete(user.id);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add features/auth/permissions/permissions.ts
git commit -m "feat: integrate role inheritance into permission checking

- Update loadUserPermissions to use getAllPermissionsForRole
- Add clearPermissionCacheForRole for cache invalidation
- Permissions now include inherited permissions from parent roles
"
```

---

## Task 5: Admin Users API

**Files:**

- Create: `features/admin/users/validations.ts`
- Create: `features/admin/users/api.ts`
- Create: `app/api/admin/users/route.ts`
- Create: `app/api/admin/users/[id]/route.ts`
- Create: `app/api/admin/users/bulk/route.ts`
- Create: `tests/integration/admin-users-api.test.ts`

- [ ] **Step 1: Write validation schemas**

Create `features/admin/users/validations.ts`:

```typescript
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.string().uuid("Invalid role ID"),
  sendInvite: z.boolean().default(false),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  roleId: z.string().uuid().optional(),
  password: z.string().min(8).optional(),
});

export const bulkDeleteUsersSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1),
});

export const bulkAssignRoleSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1),
  roleId: z.string().uuid(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type BulkDeleteUsersInput = z.infer<typeof bulkDeleteUsersSchema>;
export type BulkAssignRoleInput = z.infer<typeof bulkAssignRoleSchema>;
```

- [ ] **Step 2: Write user API functions**

Create `features/admin/users/api.ts`:

```typescript
import { db } from "@/config/database";
import { users, roles } from "@/features/database/models/schema";
import { eq, and, like, or, desc, count } from "drizzle-orm";
import { hash } from "bcryptjs";
import type { CreateUserInput, UpdateUserInput } from "./validations";

export interface UserListFilters {
  search?: string;
  roleId?: string;
  page?: number;
  limit?: number;
}

export interface UserListResult {
  users: Array<typeof users.$inferSelect & { roleName?: string }>;
  total: number;
  page: number;
  limit: number;
}

/**
 * List users with filters and pagination
 */
export async function listUsers(filters: UserListFilters = {}): Promise<UserListResult> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(or(like(users.name, searchTerm), like(users.email, searchTerm)));
  }

  if (filters.roleId) {
    conditions.push(eq(users.roleId, filters.roleId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const countResult = await db.select({ count: count() }).from(users).where(whereClause);

  const total = countResult[0]?.count || 0;

  // Get users with role names
  const usersList = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      roleId: users.roleId,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      roleName: roles.name,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(whereClause)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    users: usersList,
    total,
    page,
    limit,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  const userResult = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      roleId: users.roleId,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      roleName: roles.name,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.id, id))
    .limit(1);

  return userResult[0];
}

/**
 * Create new user
 */
export async function createUser(input: CreateUserInput) {
  const passwordHash = await hash(input.password, 12);

  const newUser = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      passwordHash,
      roleId: input.roleId,
    })
    .returning();

  return newUser[0];
}

/**
 * Update user
 */
export async function updateUser(id: string, input: UpdateUserInput) {
  const updateData: Record<string, unknown> = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.email !== undefined) updateData.email = input.email;
  if (input.roleId !== undefined) updateData.roleId = input.roleId;
  if (input.password !== undefined) {
    updateData.passwordHash = await hash(input.password, 12);
  }

  updateData.updatedAt = new Date();

  const updatedUser = await db.update(users).set(updateData).where(eq(users.id, id)).returning();

  return updatedUser[0];
}

/**
 * Delete user
 */
export async function deleteUser(id: string) {
  const deletedUser = await db.delete(users).where(eq(users.id, id)).returning();

  return deletedUser[0];
}

/**
 * Bulk delete users
 */
export async function bulkDeleteUsers(ids: string[]) {
  const deletedUsers = await db
    .delete(users)
    .where(sql`${users.id} = ANY(${ids})`)
    .returning();

  return deletedUsers;
}

/**
 * Bulk assign role
 */
export async function bulkAssignRole(ids: string[], roleId: string) {
  const updatedUsers = await db
    .update(users)
    .set({ roleId, updatedAt: new Date() })
    .where(sql`${users.id} = ANY(${ids})`)
    .returning();

  return updatedUsers;
}
```

- [ ] **Step 3: Create users list/create API route**

Create `app/api/admin/users/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/features/auth/permissions/permissions";
import { listUsers, createUser } from "@/features/admin/users/api";
import { createUserSchema } from "@/features/admin/users/validations";
import { logAction, extractIpAddress, extractUserAgent } from "@/features/admin/audit-logs/service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "users:read");

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      search: searchParams.get("search") || undefined,
      roleId: searchParams.get("roleId") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    const result = await listUsers(filters);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "users:create");

    const body = await request.json();
    const input = createUserSchema.parse(body);

    const newUser = await createUser(input);

    await logAction({
      userId: session.user.id,
      action: "user.created",
      entityType: "user",
      entityId: newUser.id,
      newData: { name: newUser.name, email: newUser.email, roleId: input.roleId },
      ipAddress: extractIpAddress(request),
      userAgent: extractUserAgent(request),
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Create user detail/update/delete API route**

Create `app/api/admin/users/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  requirePermission,
  clearPermissionCacheForRole,
} from "@/features/auth/permissions/permissions";
import { getUserById, updateUser, deleteUser } from "@/features/admin/users/api";
import { updateUserSchema } from "@/features/admin/users/validations";
import { logAction, extractIpAddress, extractUserAgent } from "@/features/admin/audit-logs/service";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "users:read");

    const user = await getUserById(params.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();

    // Prevent deleting self
    if (params.id === session.user.id) {
      return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 });
    }

    await requirePermission(session.user.id, "users:update");

    const oldUser = await getUserById(params.id);
    if (!oldUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const input = updateUserSchema.parse(body);

    const updatedUser = await updateUser(params.id, input);

    await logAction({
      userId: session.user.id,
      action: "user.updated",
      entityType: "user",
      entityId: params.id,
      oldData: { name: oldUser.name, email: oldUser.email, roleId: oldUser.roleId },
      newData: input,
      ipAddress: extractIpAddress(request),
      userAgent: extractUserAgent(request),
    });

    // Clear cache if role changed
    if (input.roleId && input.roleId !== oldUser.roleId) {
      await clearPermissionCacheForRole(input.roleId);
      if (oldUser.roleId) {
        await clearPermissionCacheForRole(oldUser.roleId);
      }
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();

    // Prevent deleting self
    if (params.id === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    await requirePermission(session.user.id, "users:delete");

    const user = await getUserById(params.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const deletedUser = await deleteUser(params.id);

    await logAction({
      userId: session.user.id,
      action: "user.deleted",
      entityType: "user",
      entityId: params.id,
      oldData: { name: user.name, email: user.email },
      ipAddress: extractIpAddress(request),
      userAgent: extractUserAgent(request),
    });

    return NextResponse.json(deletedUser);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 5: Create bulk operations API route**

Create `app/api/admin/users/bulk/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  requirePermission,
  clearPermissionCacheForRole,
} from "@/features/auth/permissions/permissions";
import { bulkDeleteUsers, bulkAssignRole } from "@/features/admin/users/api";
import { bulkDeleteUsersSchema, bulkAssignRoleSchema } from "@/features/admin/users/validations";
import { logAction, extractIpAddress, extractUserAgent } from "@/features/admin/audit-logs/service";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const action = body.action;

    if (action === "delete") {
      await requirePermission(session.user.id, "users:delete");

      const input = bulkDeleteUsersSchema.parse(body);

      // Prevent deleting self
      if (input.userIds.includes(session.user.id)) {
        return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
      }

      const deletedUsers = await bulkDeleteUsers(input.userIds);

      await logAction({
        userId: session.user.id,
        action: "users.bulk_deleted",
        entityType: "user",
        newData: { count: deletedUsers.length, userIds: input.userIds },
        ipAddress: extractIpAddress(request),
        userAgent: extractUserAgent(request),
      });

      return NextResponse.json({ deleted: deletedUsers.length });
    }

    if (action === "assignRole") {
      await requirePermission(session.user.id, "users:update");

      const input = bulkAssignRoleSchema.parse(body);
      const updatedUsers = await bulkAssignRole(input.userIds, input.roleId);

      // Clear permission cache for all affected users
      await clearPermissionCacheForRole(input.roleId);

      await logAction({
        userId: session.user.id,
        action: "users.bulk_role_assigned",
        entityType: "user",
        newData: { count: updatedUsers.length, roleId: input.roleId },
        ipAddress: extractIpAddress(request),
        userAgent: extractUserAgent(request),
      });

      return NextResponse.json({ updated: updatedUsers.length });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 6: Write integration tests**

Create `tests/integration/admin-users-api.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createUser, listUsers, updateUser, deleteUser } from "@/features/admin/users/api";

describe("Admin Users API", () => {
  it("should list users with pagination", async () => {
    const result = await listUsers({ page: 1, limit: 10 });
    expect(result.users).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it("should create a new user", async () => {
    const input = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      roleId: "test-role-id",
    };

    const user = await createUser(input);
    expect(user.name).toBe("Test User");
    expect(user.email).toBe("test@example.com");
  });
});
```

- [ ] **Step 7: Run tests**

```bash
pnpm test tests/integration/admin-users-api.test.ts
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add features/admin/users/
git add app/api/admin/users/
git add tests/integration/admin-users-api.test.ts
git commit -m "feat: implement admin users API

- Add user CRUD operations
- Add bulk operations (delete, assign role)
- Add permission checks on all endpoints
- Add audit logging
- Add validation schemas
- Prevent self-deletion/modification
- Add integration tests
"
```

---

## Task 6: Admin Roles API

**Files:**

- Create: `features/admin/roles/validations.ts`
- Create: `features/admin/roles/api.ts`
- Create: `app/api/admin/roles/route.ts`
- Create: `app/api/admin/roles/[id]/route.ts`

- [ ] **Step 1: Write validation schemas**

Create `features/admin/roles/validations.ts`:

```typescript
import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  parentRoleId: z.string().uuid().nullable().optional(),
  permissionIds: z.array(z.string().uuid()).default([]),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
  parentRoleId: z.string().uuid().nullable().optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
```

- [ ] **Step 2: Write role API functions**

Create `features/admin/roles/api.ts`:

```typescript
import { db } from "@/config/database";
import { roles, rolePermissions, users, permissions } from "@/features/database/models/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { detectCircularInheritance } from "./inheritance";
import type { CreateRoleInput, UpdateRoleInput } from "./validations";

export interface RoleListFilters {
  page?: number;
  limit?: number;
}

export interface RoleListResult {
  roles: Array<
    typeof roles.$inferSelect & {
      parentName?: string;
      permissionCount?: number;
      userCount?: number;
    }
  >;
  total: number;
  page: number;
  limit: number;
}

/**
 * List roles with stats
 */
export async function listRoles(filters: RoleListFilters = {}): Promise<RoleListResult> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  // Get total count
  const countResult = await db.select({ count: count() }).from(roles);

  const total = countResult[0]?.count || 0;

  // Get roles with related data
  const rolesList = await db.query.roles.findMany({
    with: {
      parentRole: {
        columns: { name: true },
      },
    },
    limit,
    offset,
    orderBy: [desc(roles.createdAt)],
  });

  // Get permission and user counts for each role
  const rolesWithStats = await Promise.all(
    rolesList.map(async (role) => {
      const permCount = await db
        .select({ count: count() })
        .from(rolePermissions)
        .where(eq(rolePermissions.roleId, role.id));

      const userCount = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.roleId, role.id));

      return {
        ...role,
        permissionCount: permCount[0]?.count || 0,
        userCount: userCount[0]?.count || 0,
      };
    })
  );

  return {
    roles: rolesWithStats,
    total,
    page,
    limit,
  };
}

/**
 * Get role by ID with permissions
 */
export async function getRoleById(id: string) {
  const role = await db.query.roles.findFirst({
    where: eq(roles.id, id),
    with: {
      parentRole: {
        columns: { id: true, name: true },
      },
      rolePermissions: {
        with: {
          permission: true,
        },
      },
    },
  });

  if (!role) return null;

  return {
    ...role,
    permissionIds: role.rolePermissions.map((rp) => rp.permission.id),
  };
}

/**
 * Create new role
 */
export async function createRole(input: CreateRoleInput) {
  // Check for circular inheritance if parentRoleId is set
  if (input.parentRoleId) {
    const isCircular = await detectCircularInheritance("new", input.parentRoleId);
    if (isCircular) {
      throw new Error("Circular role inheritance detected");
    }
  }

  const newRole = await db
    .insert(roles)
    .values({
      name: input.name,
      description: input.description,
      parentRoleId: input.parentRoleId,
    })
    .returning();

  // Assign permissions
  if (input.permissionIds.length > 0) {
    await db.insert(rolePermissions).values(
      input.permissionIds.map((permissionId) => ({
        roleId: newRole[0].id,
        permissionId,
      }))
    );
  }

  return getRoleById(newRole[0].id);
}

/**
 * Update role
 */
export async function updateRole(id: string, input: UpdateRoleInput) {
  const existingRole = await getRoleById(id);
  if (!existingRole) {
    throw new Error("Role not found");
  }

  // Check for circular inheritance if parentRoleId is changing
  if (input.parentRoleId !== undefined && input.parentRoleId !== existingRole.parentRoleId) {
    const isCircular = await detectCircularInheritance(id, input.parentRoleId || "");
    if (isCircular) {
      throw new Error("Circular role inheritance detected");
    }
  }

  // Update role
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.parentRoleId !== undefined) updateData.parentRoleId = input.parentRoleId;
  updateData.updatedAt = new Date();

  await db.update(roles).set(updateData).where(eq(roles.id, id));

  // Update permissions if provided
  if (input.permissionIds !== undefined) {
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));

    if (input.permissionIds.length > 0) {
      await db.insert(rolePermissions).values(
        input.permissionIds.map((permissionId) => ({
          roleId: id,
          permissionId,
        }))
      );
    }
  }

  return getRoleById(id);
}

/**
 * Delete role
 */
export async function deleteRole(id: string) {
  // Check if role has users
  const usersWithRole = await db.select({ count: count() }).from(users).where(eq(users.roleId, id));

  if ((usersWithRole[0]?.count || 0) > 0) {
    throw new Error("Cannot delete role with assigned users");
  }

  const deletedRole = await db.delete(roles).where(eq(roles.id, id)).returning();

  return deletedRole[0];
}

/**
 * Get users with a specific role
 */
export async function getRoleUsers(roleId: string) {
  const roleUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.roleId, roleId))
    .orderBy(desc(users.createdAt));

  return roleUsers;
}
```

- [ ] **Step 3: Create roles list/create API route**

Create `app/api/admin/roles/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/features/auth/permissions/permissions";
import { listRoles, createRole } from "@/features/admin/roles/api";
import { createRoleSchema } from "@/features/admin/roles/validations";
import { logAction, extractIpAddress, extractUserAgent } from "@/features/admin/audit-logs/service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "roles:read");

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    const result = await listRoles(filters);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "roles:manage");

    const body = await request.json();
    const input = createRoleSchema.parse(body);

    const newRole = await createRole(input);

    await logAction({
      userId: session.user.id,
      action: "role.created",
      entityType: "role",
      entityId: newRole.id,
      newData: { name: newRole.name, parentRoleId: input.parentRoleId },
      ipAddress: extractIpAddress(request),
      userAgent: extractUserAgent(request),
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Create role detail/update/delete API route**

Create `app/api/admin/roles/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  requirePermission,
  clearPermissionCacheForRole,
} from "@/features/auth/permissions/permissions";
import { getRoleById, updateRole, deleteRole, getRoleUsers } from "@/features/admin/roles/api";
import { updateRoleSchema } from "@/features/admin/roles/validations";
import { logAction, extractIpAddress, extractUserAgent } from "@/features/admin/audit-logs/service";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "roles:read");

    const role = await getRoleById(params.id);

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json(role);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "roles:manage");

    const oldRole = await getRoleById(params.id);
    if (!oldRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const body = await request.json();
    const input = updateRoleSchema.parse(body);

    const updatedRole = await updateRole(params.id, input);

    await logAction({
      userId: session.user.id,
      action: "role.updated",
      entityType: "role",
      entityId: params.id,
      oldData: { name: oldRole.name, parentRoleId: oldRole.parentRoleId },
      newData: input,
      ipAddress: extractIpAddress(request),
      userAgent: extractUserAgent(request),
    });

    // Clear permission cache for all users with this role
    await clearPermissionCacheForRole(params.id);

    return NextResponse.json(updatedRole);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "roles:manage");

    const role = await getRoleById(params.id);
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const deletedRole = await deleteRole(params.id);

    await logAction({
      userId: session.user.id,
      action: "role.deleted",
      entityType: "role",
      entityId: params.id,
      oldData: { name: role.name },
      ipAddress: extractIpAddress(request),
      userAgent: extractUserAgent(request),
    });

    return NextResponse.json(deletedRole);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add features/admin/roles/
git add app/api/admin/roles/
git commit -m "feat: implement admin roles API

- Add role CRUD operations
- Support role inheritance with circular detection
- Add permission assignment to roles
- Add role user listing
- Add permission checks and audit logging
- Prevent deleting roles with assigned users
"
```

---

## Task 7: Admin Permissions & Audit Logs API

**Files:**

- Create: `app/api/admin/permissions/route.ts`
- Create: `app/api/admin/audit-logs/route.ts`

- [ ] **Step 1: Create permissions list API**

Create `app/api/admin/permissions/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/features/auth/permissions/permissions";
import { db } from "@/config/database";
import { permissions } from "@/features/database/models/schema";
import { asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "roles:read");

    const allPermissions = await db
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
```

- [ ] **Step 2: Create audit logs API**

Create `app/api/admin/audit-logs/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/features/auth/permissions/permissions";
import { getAuditLogs } from "@/features/admin/audit-logs/api";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "audit:read");

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      startDate: searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined,
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
      action: searchParams.get("action") || undefined,
      entityType: searchParams.get("entityType") || undefined,
      entityId: searchParams.get("entityId") || undefined,
      userId: searchParams.get("userId") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "50"),
    };

    const result = await getAuditLogs(filters);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/permissions/
git add app/api/admin/audit-logs/
git commit -m "feat: implement permissions and audit logs API

- Add permissions list endpoint grouped by category
- Add audit logs query endpoint with filters
- Add pagination support
"
```

---

## Task 8: User Profile & Settings API

**Files:**

- Create: `features/profile/validations.ts`
- Create: `features/profile/api.ts`
- Create: `features/security/validations.ts`
- Create: `features/security/api.ts`
- Create: `app/api/settings/profile/route.ts`
- Create: `app/api/settings/password/route.ts`
- Create: `app/api/settings/sessions/route.ts`
- Create: `app/api/settings/sessions/[id]/route.ts`

- [ ] **Step 1: Write profile validation schemas**

Create `features/profile/validations.ts`:

```typescript
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
});

export const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
```

- [ ] **Step 2: Write profile API functions**

Create `features/profile/api.ts`:

```typescript
import { db } from "@/config/database";
import { users, userProfiles } from "@/features/database/models/schema";
import { eq } from "drizzle-orm";
import type { UpdateProfileInput, UpdatePreferencesInput } from "./validations";

/**
 * Get user profile with details
 */
export async function getUserProfile(userId: string) {
  const user = await db.query.users.findFirst({
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
  // Update user table
  await db
    .update(users)
    .set({
      name: input.name,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Update or insert profile
  const existingProfile = await db.query.userProfiles.findFirst({
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
  const existingProfile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  });

  const currentPrefs = existingProfile?.preferences || {};
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
```

- [ ] **Step 3: Write security validation and API**

Create `features/security/validations.ts`:

```typescript
import { z } from "zod";

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
```

Create `features/security/api.ts`:

```typescript
import { db } from "@/config/database";
import { users, userSessions } from "@/features/database/models/schema";
import { eq, and, desc } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import type { ChangePasswordInput } from "./validations";

/**
 * Change user password
 */
export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await db.query.users.findFirst({
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

  // Revoke all other sessions
  await db
    .delete(userSessions)
    .where(
      and(
        eq(userSessions.userId, userId),
        sql`${userSessions.token} != ${getCurrentSessionToken()}`
      )
    );

  return { success: true };
}

/**
 * Get active sessions for user
 */
export async function getUserSessions(userId: string) {
  const sessions = await db.query.userSessions.findMany({
    where: eq(userSessions.userId, userId),
    orderBy: [desc(userSessions.lastActive)],
  });

  return sessions;
}

/**
 * Revoke a session
 */
export async function revokeSession(sessionId: string, userId: string) {
  await db
    .delete(userSessions)
    .where(and(eq(userSessions.id, sessionId), eq(userSessions.userId, userId)));
}

// Helper to get current session token (implement based on your auth)
function getCurrentSessionToken(): string {
  // This would come from your session management
  return "";
}
```

- [ ] **Step 4: Create profile API route**

Create `app/api/settings/profile/route.ts`:

```typescript
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
```

- [ ] **Step 5: Create password change API route**

Create `app/api/settings/password/route.ts`:

```typescript
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
```

- [ ] **Step 6: Create sessions API routes**

Create `app/api/settings/sessions/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/features/auth/permissions/permissions";
import { getUserSessions } from "@/features/security/api";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const sessions = await getUserSessions(session.user.id);

    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

Create `app/api/settings/sessions/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/features/auth/permissions/permissions";
import { revokeSession } from "@/features/security/api";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();

    await revokeSession(params.id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add features/profile/
git add features/security/
git add app/api/settings/
git commit -m "feat: implement user settings API

- Add profile CRUD operations
- Add password change with verification
- Add session management (list, revoke)
- Add preferences update
- Add validation schemas
"
```

---

## Task 9: Admin Layout & Navigation

**Files:**

- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Modify: `components/app-sidebar.tsx` (add admin link)

- [ ] **Step 1: Create admin layout**

Create `app/admin/layout.tsx`:

```typescript
import { redirect } from "next/navigation";
import { auth, requireAuth } from "@/features/auth/permissions/permissions";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has admin permissions
  try {
    await requireAuth();
    await requirePermission(session.user.id, "users:read");
  } catch {
    redirect("/unauthorized");
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create admin sidebar component**

Create `components/admin/admin-sidebar.tsx`:

```typescript
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Users",
    href: "/admin/users",
    permission: "users:read",
  },
  {
    title: "Roles",
    href: "/admin/roles",
    permission: "roles:read",
  },
  {
    title: "Permissions",
    href: "/admin/permissions",
    permission: "roles:read",
  },
  {
    title: "Audit Logs",
    href: "/admin/audit-logs",
    permission: "audit:read",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-background">
      <div className="p-6">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="px-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block px-4 py-2 rounded-md mb-1",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 3: Create admin dashboard page**

Create `app/admin/page.tsx`:

```typescript
import { Suspense } from "react";
import { db } from "@/config/database";
import { users, roles, auditLogs } from "@/features/database/models/schema";
import { count } from "drizzle-orm";

export default async function AdminDashboard() {
  const [userCount, roleCount] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(roles),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Total Users" value={userCount[0]?.count || 0} />
        <StatsCard title="Total Roles" value={roleCount[0]?.count || 0} />
        <StatsCard title="Active Sessions" value="0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  );
}

function StatsCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="space-y-2">
        <a href="/admin/users/new" className="block p-3 border rounded hover:bg-muted">
          Create New User
        </a>
        <a href="/admin/roles/new" className="block p-3 border rounded hover:bg-muted">
          Create New Role
        </a>
      </div>
    </div>
  );
}

function RecentActivity() {
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <p className="text-sm text-muted-foreground">View audit logs for recent activity</p>
      <a href="/admin/audit-logs" className="text-sm text-primary hover:underline">
        View All Logs →
      </a>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/
git add components/admin/
git commit -m "feat: add admin layout and dashboard

- Add admin layout with permission check
- Add admin sidebar with navigation
- Add admin dashboard with stats
- Add quick actions and recent activity
"
```

---

## Task 10: Users List Page

**Files:**

- Create: `app/admin/users/page.tsx`
- Create: `components/admin/data-table.tsx`
- Create: `components/admin/bulk-actions-bar.tsx`

- [ ] **Step 1: Create data table component**

Create `components/admin/data-table.tsx`:

```typescript
"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="border rounded-lg">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 text-left text-sm font-medium">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center">
                No results.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Create bulk actions bar**

Create `components/admin/bulk-actions-bar.tsx`:

```typescript
"use client";

import { Trash2, Shield } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete?: () => void;
  onAssignRole?: () => void;
}

export function BulkActionsBar({ selectedCount, onDelete, onAssignRole }: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-background border rounded-lg shadow-lg p-4 flex items-center gap-4">
      <span className="text-sm font-medium">{selectedCount} selected</span>
      <div className="flex gap-2">
        {onAssignRole && (
          <button
            onClick={onAssignRole}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md"
          >
            <Shield className="w-4 h-4" />
            Assign Role
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create users list page**

Create `app/admin/users/page.tsx`:

```typescript
import { Suspense } from "react";
import { UsersTable } from "@/components/admin/users-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Link href="/admin/users/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <UsersTable />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 4: Create users table component**

Create `components/admin/users-table.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/admin/data-table";
import { BulkActionsBar } from "@/components/admin/bulk-actions-bar";
import { Checkbox } from "@/components/ui/checkbox";

const columns = [
  {
    id: "select",
    header: ({ table }: any) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }: any) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: any) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "roleName",
    header: "Role",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => (
      <a href={`/admin/users/${row.original.id}`} className="text-primary hover:underline">
        Edit
      </a>
    ),
  },
];

export function UsersTable() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <DataTable columns={columns} data={data?.users || []} />
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onDelete={() => {/* TODO */}}
        onAssignRole={() => {/* TODO */}}
      />
    </>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/admin/users/
git add components/admin/
git commit -m "feat: add users list page

- Add users list with data table
- Add bulk actions bar
- Add selection support
- Add filters and search (TODO)
"
```

---

## Task 11: Remaining Admin Pages (Roles, Permissions, Audit Logs)

**Files:**

- Create: `app/admin/roles/page.tsx`
- Create: `app/admin/permissions/page.tsx`
- Create: `app/admin/audit-logs/page.tsx`
- Create: `components/admin/role-hierarchy-tree.tsx`
- Create: `components/admin/audit-log-timeline.tsx`

- [ ] **Step 1: Create roles page**

Create `app/admin/roles/page.tsx`:

```typescript
import { Suspense } from "react";
import { RolesTable } from "@/components/admin/roles-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function RolesPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Roles</h1>
          <p className="text-muted-foreground">Manage roles and permissions</p>
        </div>
        <Link href="/admin/roles/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Role
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <RolesTable />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 2: Create roles table component**

Create `components/admin/roles-table.tsx`:

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/admin/data-table";
import Link from "next/link";

const columns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: any) => (
      <Link href={`/admin/roles/${row.original.id}`} className="text-primary hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "parentName",
    header: "Parent Role",
  },
  {
    accessorKey: "userCount",
    header: "Users",
  },
  {
    accessorKey: "permissionCount",
    header: "Permissions",
  },
];

export function RolesTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const res = await fetch("/api/admin/roles");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return <DataTable columns={columns} data={data?.roles || []} />;
}
```

- [ ] **Step 3: Create permissions page**

Create `app/admin/permissions/page.tsx`:

```typescript
import { Suspense } from "react";
import { PermissionsList } from "@/components/admin/permissions-list";

export default function PermissionsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Permissions</h1>
        <p className="text-muted-foreground">View all available permissions</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <PermissionsList />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 4: Create permissions list component**

Create `components/admin/permissions-list.tsx`:

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export function PermissionsList() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: async () => {
      const res = await fetch("/api/admin/permissions");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {Object.entries(data?.grouped || {}).map(([category, perms]: [string, any]) => (
        <div key={category}>
          <h2 className="text-lg font-semibold mb-3 capitalize">{category}</h2>
          <div className="border rounded-lg divide-y">
            {perms.map((perm: any) => (
              <div key={perm.id} className="px-4 py-3">
                <code className="text-sm">{perm.name}</code>
                <p className="text-sm text-muted-foreground mt-1">{perm.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create audit logs page**

Create `app/admin/audit-logs/page.tsx`:

```typescript
import { Suspense } from "react";
import { AuditLogsTimeline } from "@/components/admin/audit-log-timeline";

export default function AuditLogsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">Track all administrative actions</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <AuditLogsTimeline />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 6: Create audit log timeline component**

Create `components/admin/audit-log-timeline.tsx`:

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export function AuditLogsTimeline() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/audit-logs");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {data?.logs.map((log: any) => (
        <div key={log.id} className="border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{log.action}</p>
              <p className="text-sm text-muted-foreground">
                by {log.userName} • {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {log.ipAddress}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add app/admin/roles/
git add app/admin/permissions/
git add app/admin/audit-logs/
git add components/admin/
git commit -m "feat: add remaining admin pages

- Add roles list page
- Add permissions library page
- Add audit logs timeline
- Add corresponding components
"
```

---

## Task 12: User Settings Pages

**Files:**

- Create: `app/settings/layout.tsx`
- Create: `app/settings/profile/page.tsx`
- Create: `app/settings/security/page.tsx`
- Create: `components/profile/profile-form.tsx`
- Create: `components/profile/password-change-form.tsx`
- Create: `components/profile/session-list.tsx`

- [ ] **Step 1: Create settings layout**

Create `app/settings/layout.tsx`:

```typescript
import { redirect } from "next/navigation";
import { auth } from "@/features/auth/permissions/permissions";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create profile page**

Create `app/settings/profile/page.tsx`:

```typescript
import { Suspense } from "react";
import { ProfileForm } from "@/components/profile/profile-form";

export default function ProfileSettingsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Profile</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <ProfileForm />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 3: Create profile form component**

Create `components/profile/profile-form.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProfileForm() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/settings/profile");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate(Object.fromEntries(formData));
  };

  if (!data) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={data.name} required />
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={data.profile?.bio} rows={3} />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={data.profile?.phone} />
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" defaultValue={data.profile?.address} rows={2} />
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 4: Create security page**

Create `app/settings/security/page.tsx`:

```typescript
import { Suspense } from "react";
import { PasswordChangeForm } from "@/components/profile/password-change-form";
import { SessionList } from "@/components/profile/session-list";

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Change Password</h2>
        <Suspense fallback={<div>Loading...</div>}>
          <PasswordChangeForm />
        </Suspense>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Active Sessions</h2>
        <Suspense fallback={<div>Loading...</div>}>
          <SessionList />
        </Suspense>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create password change form**

Create `components/profile/password-change-form.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordChangeForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      return data;
    },
    onSuccess: () => {
      setSuccess(true);
      setError("");
    },
    onError: (err: Error) => {
      setError(err.message);
      setSuccess(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    mutation.mutate(Object.fromEntries(formData));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-10 text-green-600 rounded-md">
          Password changed successfully. You will need to log in again.
        </div>
      )}

      <div>
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </div>

      <div>
        <Label htmlFor="newPassword">New Password</Label>
        <Input id="newPassword" name="newPassword" type="password" required minLength={8} />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Changing..." : "Change Password"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 6: Create session list component**

Create `components/profile/session-list.tsx`:

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";

export function SessionList() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await fetch("/api/settings/sessions");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetch(`/api/settings/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to revoke");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {data.map((session: any) => (
        <div key={session.id} className="border rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">
              {session.userAgent?.includes("Chrome") && "Chrome"}
              {session.userAgent?.includes("Firefox") && "Firefox"}
              {session.userAgent?.includes("Safari") && "Safari"}
            </p>
            <p className="text-sm text-muted-foreground">
              {session.ipAddress} • Last active {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => revokeMutation.mutate(session.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add app/settings/
git add components/profile/
git commit -m "feat: add user settings pages

- Add profile editing form
- Add password change form
- Add active sessions list with revoke
- Add settings layout
"
```

---

## Task 13: E2E Tests

**Files:**

- Create: `tests/e2e/admin-users.spec.ts`
- Create: `tests/e2e/admin-roles.spec.ts`
- Create: `tests/e2e/user-settings.spec.ts`

- [ ] **Step 1: Write admin users E2E test**

Create `tests/e2e/admin-users.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Admin Users", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/login");
    await page.fill('[name="email"]', "admin@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should display users list", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page.locator("h1")).toContainText("Users");
    await expect(page.locator("table")).toBeVisible();
  });

  test("should create new user", async ({ page }) => {
    await page.goto("/admin/users/new");
    await page.fill('[name="name"]', "Test User");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password123");
    await page.selectOption('[name="roleId"]', "User");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/admin/users");
    await expect(page.locator("text=Test User")).toBeVisible();
  });

  test("should delete user", async ({ page }) => {
    await page.goto("/admin/users");
    const userRow = page.locator("text=Test User").first();
    await userRow.click();

    await page.click("text=Delete");
    await page.click("text=Confirm");

    await expect(page.locator("text=Test User")).not.toBeVisible();
  });
});
```

- [ ] **Step 2: Write admin roles E2E test**

Create `tests/e2e/admin-roles.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Admin Roles", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', "admin@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('button[type="submit"]');
  });

  test("should display roles list", async ({ page }) => {
    await page.goto("/admin/roles");
    await expect(page.locator("h1")).toContainText("Roles");
    await expect(page.locator("table")).toBeVisible();
  });

  test("should create new role", async ({ page }) => {
    await page.goto("/admin/roles/new");
    await page.fill('[name="name"]', "Test Role");
    await page.fill('[name="description"]', "A test role");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/admin/roles");
    await expect(page.locator("text=Test Role")).toBeVisible();
  });
});
```

- [ ] **Step 3: Write user settings E2E test**

Create `tests/e2e/user-settings.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("User Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', "user@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('button[type="submit"]');
  });

  test("should update profile", async ({ page }) => {
    await page.goto("/settings/profile");
    await page.fill('[name="name"]', "Updated Name");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Changes saved")).toBeVisible();
  });

  test("should change password", async ({ page }) => {
    await page.goto("/settings/security");
    await page.fill('[name="currentPassword"]', "password");
    await page.fill('[name="newPassword"]', "newpassword123");
    await page.fill('[name="confirmPassword"]', "newpassword123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/login");
  });
});
```

- [ ] **Step 4: Run E2E tests**

```bash
pnpm test:e2e
```

Expected: Tests pass

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/
git commit -m "test: add E2E tests for admin and settings

- Add admin users E2E tests
- Add admin roles E2E tests
- Add user settings E2E tests
- Test CRUD operations and workflows
"
```

---

## Task 14: Add Required Dependencies

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install dependencies**

```bash
pnpm add @tanstack/react-query@^5.0.0
pnpm add react-hook-form@^7.0.0
pnpm add @hookform/resolvers@^3.0.0
pnpm add date-fns@^3.0.0
pnpm add -D @types/bcryptjs
pnpm add bcryptjs
```

Expected: Dependencies installed successfully

- [ ] **Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add required dependencies

- Add @tanstack/react-query for data fetching
- Add react-hook-form for form management
- Add @hookform/resolvers for Zod integration
- Add date-fns for date formatting
- Add bcryptjs for password hashing
"
```

---

## Task 15: Seed Default Permissions

**Files:**

- Create: `features/database/seed/permissions-seed.ts`

- [ ] **Step 1: Create permissions seed script**

Create `features/database/seed/permissions-seed.ts`:

```typescript
import { db } from "@/config/database";
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
  console.log("Seeding permissions...");

  for (const permission of defaultPermissions) {
    await db.insert(permissions).values(permission).onConflictDoNothing();
  }

  console.log(`Seeded ${defaultPermissions.length} permissions`);
}
```

- [ ] **Step 2: Update seed script to include permissions**

Modify `features/database/seed/seed.ts` to import and run `seedPermissions`.

- [ ] **Step 3: Run seed**

```bash
pnpm db:seed
```

Expected: Permissions seeded successfully

- [ ] **Step 4: Commit**

```bash
git add features/database/seed/
git commit -m "feat: add default permissions seed

- Add seed script for default permissions
- Include users, roles, audit, content, system categories
"
```

---

## Task 16: Final Polish & Documentation

**Files:**

- Create: `docs/superpowers/admin-user-management-guide.md`
- Modify: `README.md`

- [ ] **Step 1: Create admin guide**

Create `docs/superpowers/admin-user-management-guide.md` with:

- Setup instructions
- How to use admin panel
- Permission system explanation
- Role inheritance guide
- Troubleshooting

- [ ] **Step 2: Update README**

Add section about admin features to main README.

- [ ] **Step 3: Run all tests**

```bash
pnpm test
pnpm test:e2e
```

Expected: All tests pass

- [ ] **Step 4: Lint and format**

```bash
pnpm lint
pnpm format
```

Expected: No linting errors

- [ ] **Step 5: Build verification**

```bash
pnpm build
```

Expected: Build succeeds

- [ ] **Step 6: Final commit**

```bash
git add docs/
git add README.md
git commit -m "docs: add admin user management guide

- Add comprehensive admin panel guide
- Update README with admin features
- All tests passing
- Build verified
"
```

---

## Task 17: Create Pull Request

- [ ] **Step 1: Push to remote**

```bash
git push -u origin feature/admin-user-management
```

- [ ] **Step 2: Create pull request**

```bash
gh pr create --title "feat: Admin User Management & Profile System" --body "$(cat <<'EOF'
## Summary

Implements comprehensive admin panel for user/role/permission management with enhanced RBAC including role inheritance, plus user profile and security settings.

## Features

- **Admin Panel**
  - User management with CRUD operations
  - Role management with inheritance support
  - Permission library
  - Audit logs with timeline view
  - Bulk operations

- **Enhanced RBAC**
  - Role inheritance with circular detection
  - Recursive permission resolution
  - 5-minute permission cache
  - Automatic cache invalidation

- **User Settings**
  - Profile editing
  - Password change
  - Session management

## Database Changes

- Added `parentRoleId` to roles table
- Added `audit_logs` table
- Added `user_profiles` table
- Added `user_sessions` table

## Testing

- Unit tests for role inheritance and audit logging
- Integration tests for API routes
- E2E tests for key workflows

## Checklist

- [ ] All tests passing
- [ ] E2E tests passing
- [ ] Build verified
- [ ] Documentation complete
- [ ] Migration tested

## Breaking Changes

None. All changes are additive.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 7: Verify PR created**

Expected: Pull request created successfully

---

## Completion Checklist

- [ ] All tasks completed
- [ ] All tests passing (unit, integration, E2E)
- [ ] Build succeeds
- [ ] Documentation complete
- [ ] Pull request created and ready for review
- [ ] Migration SQL reviewed
- [ ] Security audit completed (permission checks, input validation, SQL injection prevention)

---

**End of Implementation Plan**
