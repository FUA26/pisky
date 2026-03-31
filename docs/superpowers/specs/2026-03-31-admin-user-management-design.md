# Admin User Management & Profile System - Design Spec

**Date:** 2026-03-31
**Status:** Draft
**Author:** Design Team
**Timeline:** 4 weeks

## Overview

Build a comprehensive admin panel for user, role, and permission management with an enhanced RBAC system featuring role inheritance. Additionally, provide user profile and security settings management.

## Goals

1. Enable administrators to manage users, roles, and permissions through a unified admin interface
2. Implement role inheritance for flexible permission management
3. Provide audit logging for all administrative actions
4. Allow users to manage their profiles and security settings
5. Maintain security with proper permission checks and validation

## Non-Goals

- Micro-frontend architecture (using monolithic approach)
- OAuth providers (can be added later)
- Advanced analytics/reporting dashboard
- Multi-tenancy support

## Architecture

### High-Level Structure

```
Pisky Application
├── /admin/*              - Admin Panel (permission-protected)
│   ├── users/           - User CRUD, bulk operations
│   ├── roles/           - Role CRUD with inheritance
│   ├── permissions/     - Permission library
│   └── audit-logs/      - Activity logs
├── /settings/*          - User Settings (authenticated)
│   ├── profile/         - Profile editing
│   └── security/        - Password, sessions
└── Enhanced RBAC Layer  - Permission inheritance, caching
```

### Technology Stack

- **Framework:** Next.js 16 with App Router
- **UI:** React 19, Tailwind CSS 4, Shadcn UI
- **Database:** PostgreSQL with Drizzle ORM
- **State:** React Query for server state
- **Forms:** React Hook Form + Zod validation
- **Testing:** Vitest (unit/integration), Playwright (E2E)

## Database Schema

### New Tables

```sql
-- Role inheritance support
ALTER TABLE roles ADD COLUMN parentRoleId UUID REFERENCES roles(id);

-- Audit logging
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  entityType VARCHAR(50),
  entityId UUID,
  oldData JSONB,
  newData JSONB,
  ipAddress TEXT,
  userAgent TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- User profiles
CREATE TABLE user_profiles (
  userId UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  phone VARCHAR(20),
  address TEXT,
  preferences JSONB DEFAULT '{}',
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- User sessions for security
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id),
  token VARCHAR(255) NOT NULL UNIQUE,
  ipAddress TEXT,
  userAgent TEXT,
  lastActive TIMESTAMP DEFAULT NOW(),
  expiresAt TIMESTAMP NOT NULL
);
```

### Schema Definitions

```typescript
export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  parentRoleId: uuid("parentRoleId").references(() => roles.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: uuid("entityId"),
  oldData: jsonb("oldData"),
  newData: jsonb("newData"),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  userId: uuid("userId").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  preferences: jsonb("preferences").default('{}'),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const userSessions = pgTable("user_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id),
  token: varchar("token"). { length: 255 }).notNull().unique(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  lastActive: timestamp("lastActive").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});
```

## Features

### 1. Admin Panel

#### User Management

- **List Users:** Paginated table with search, filters (role, status), sorting
- **Create User:** Form with name, email, role assignment, password options
- **Edit User:** Update details, change role, reset password
- **Delete User:** Single and bulk delete with confirmation
- **User Activity:** View individual user's audit log
- **Bulk Operations:** Assign roles, delete multiple users

#### Role Management

- **List Roles:** Hierarchical tree view showing inheritance
- **Create Role:** Name, description, parent role selection, permissions
- **Edit Role:** Update details, change parent, modify permissions
- **Delete Role:** Validation to prevent orphaned users
- **Role Users:** View all users assigned to a role

#### Permission Management

- **Permission Library:** Read-only list of all permissions grouped by category
- **Categories:** users, roles, content, system, audit

#### Audit Logs

- **Timeline View:** Chronological display of all admin actions
- **Filters:** Date range, action type, entity type, specific user
- **Detail View:** Show oldData/newData for each action

### 2. User Settings

#### Profile Management

- **Edit Profile:** Name, email, avatar upload, bio
- **Avatar Upload:** Max 2MB, image formats, automatic resize
- **Preferences:** Theme, language (stored as JSON in preferences)

#### Security Settings

- **Change Password:** Current password verification, strength validation
- **Active Sessions:** List all devices/sessions with revoke capability
- **Security Log:** View own security-related events

### 3. Enhanced RBAC

#### Role Inheritance

- Roles can have a parent role
- Child roles inherit all parent permissions
- Supports multi-level inheritance chains
- Prevents circular inheritance

#### Permission Checking

- Recursive permission resolution through inheritance tree
- 5-minute cache TTL for performance
- Cache invalidation on role updates

#### Audit Logging

- Automatic logging of all CRUD operations
- Tracks: who, what, when, IP, user agent
- Stores before/after state for updates

## API Routes

### Admin Routes (Permission Protected)

```
GET    /api/admin/users           - List users with pagination/filters
POST   /api/admin/users           - Create new user
GET    /api/admin/users/:id       - Get user details
PATCH  /api/admin/users/:id       - Update user
DELETE /api/admin/users/:id       - Delete user
POST   /api/admin/users/bulk      - Bulk operations

GET    /api/admin/roles           - List roles with hierarchy
POST   /api/admin/roles           - Create role
GET    /api/admin/roles/:id       - Get role details
PATCH  /api/admin/roles/:id       - Update role
DELETE /api/admin/roles/:id       - Delete role
GET    /api/admin/roles/:id/users - Get users with role

GET    /api/admin/permissions     - List all permissions
GET    /api/admin/audit-logs      - List audit logs with filters
```

### Settings Routes (Authenticated)

```
GET    /api/settings/profile      - Get current profile
PATCH  /api/settings/profile      - Update profile
POST   /api/settings/avatar       - Upload avatar

PATCH  /api/settings/password     - Change password
GET    /api/settings/sessions     - List active sessions
DELETE /api/settings/sessions/:id - Revoke session
```

## Permission System

### Permission Format

```
<resource>:<action>

Examples:
- users:read
- users:create
- users:update
- users:delete
- roles:manage
- audit:read
```

### Required Permissions

```
Admin Routes:
- /admin/users          → users:read
- POST /admin/users     → users:create
- PATCH /admin/users/:id→ users:update
- DELETE /admin/users/:id→ users:delete
- /admin/roles          → roles:read
- /admin/audit-logs     → audit:read

Settings Routes:
- /settings/profile     → Always allowed (authenticated)
- /settings/security    → Always allowed (authenticated)
```

### Inheritance Logic

```typescript
// Recursive permission resolution
async function getAllPermissionsForRole(roleId: string): Promise<Permission[]> {
  const role = await getRole(roleId);
  const directPermissions = await getRolePermissions(roleId);
  let inheritedPermissions: Permission[] = [];

  if (role.parentRoleId) {
    inheritedPermissions = await getAllPermissionsForRole(role.parentRoleId);
  }

  return [...new Set([...directPermissions, ...inheritedPermissions])];
}
```

## Error Handling

### Error Categories

1. **Permission Errors (403):** Missing required permission, redirect to unauthorized page
2. **Validation Errors (400):** Invalid input, duplicate email, circular inheritance
3. **Not Found (404):** User/role ID doesn't exist
4. **Server Errors (500):** Database failures, log to console, show generic message
5. **Authentication Errors (401):** Session expired, redirect to login

### Edge Cases

- Cannot delete own account
- Cannot delete last super-admin
- Cannot create circular role inheritance
- Cannot delete role with assigned users (unless reassigning)
- Prevent concurrent edit conflicts (audit trail helps recovery)
- Avatar upload failures (network, size, format)
- Session revocation from other devices

## Component Architecture

### Admin Components

```
components/admin/
├── data-table.tsx              # Reusable table component
├── bulk-actions-bar.tsx        # Bulk operation UI
├── user-form.tsx              # User create/edit form
├── role-form.tsx              # Role create/edit form
├── permission-tree.tsx        # Permission checkboxes
├── audit-log-timeline.tsx     # Timeline visualization
└── role-hierarchy-tree.tsx    # Role inheritance tree
```

### Profile Components

```
components/profile/
├── profile-form.tsx           # Profile editing
├── password-change-form.tsx   # Password update
└── session-list.tsx           # Active sessions
```

## Testing Strategy

### Unit Tests (Vitest)

- Permission inheritance logic
- Audit log formatting
- Validation schemas
- Utility functions

### Integration Tests

- API routes with test database
- Permission checks
- CRUD operations

### E2E Tests (Playwright)

- Admin creates user
- Admin assigns role
- User updates profile
- User changes password
- Bulk operations
- Permission-protected route access

### Performance Tests

- Permission cache effectiveness
- Bulk operation performance (100 users < 5s)
- Query optimization

## Security Considerations

1. **Permission Checks:** All admin routes protected by middleware
2. **Input Validation:** Zod schemas on all API endpoints
3. **SQL Injection:** Use Drizzle ORM parameterized queries
4. **XSS Prevention:** React auto-escapes, validate user input
5. **CSRF:** Next.js built-in CSRF protection
6. **Rate Limiting:** Sensitive endpoints (password change)
7. **Audit Trail:** All admin actions logged
8. **Session Management:** Secure token storage, expiration

## Implementation Phases

### Week 1: Foundation

- Database schema changes
- Role inheritance implementation
- Audit logging service
- Permission cache

### Week 2: Admin Backend

- Admin API routes
- Permission middleware
- API tests

### Week 3: Admin Frontend

- Admin UI components
- Admin pages
- E2E tests

### Week 4: User Settings & Polish

- Settings API routes
- Settings UI
- Performance optimization
- Final testing

## Migration Plan

```sql
-- Production migration
ALTER TABLE roles ADD COLUMN parentRoleId UUID REFERENCES roles(id);

CREATE TABLE audit_logs (...);
CREATE TABLE user_profiles (...);
CREATE TABLE user_sessions (...);

-- Seed default roles
INSERT INTO roles (name, description) VALUES
  ('Super Admin', 'Full system access'),
  ('Admin', 'Administrative access'),
  ('Moderator', 'Content moderation'),
  ('Editor', 'Content editing'),
  ('User', 'Regular user');
```

## Success Criteria

- ✅ Admin can create, edit, delete users
- ✅ Admin can manage roles with inheritance
- ✅ All admin actions logged to audit trail
- ✅ Users can update profile and password
- ✅ Permission checks work correctly
- ✅ Role inheritance functions as expected
- ✅ All tests passing (unit, integration, E2E)
- ✅ Responsive on mobile devices
- ✅ Accessible (keyboard navigation, screen readers)

## Open Questions

None at this time.

## References

- Existing RBAC implementation: `/features/auth/permissions/`
- Database schema: `/features/database/models/schema.ts`
- Shadcn UI: https://ui.shadcn.com/
