# Admin User Management System

Complete admin panel for user management, role-based access control (RBAC), and user settings.

## Features

### 1. User Management

- **List Users**: Paginated table with search and filtering
- **Create/Edit Users**: Full CRUD operations
- **Bulk Operations**: Delete multiple users, assign roles in batch
- **User Profiles**: Extended profile fields (bio, phone, address)

### 2. Role & Permission Management

- **Role Hierarchy**: Parent-child relationships with permission inheritance
- **Permission Library**: 13 default permissions organized by category
- **Circular Reference Detection**: Prevents infinite loops in role inheritance
- **Permission Caching**: 5-minute TTL with targeted invalidation

### 3. Audit Logging

- **Complete Audit Trail**: Track all admin actions
- **Action Types**: CREATE, UPDATE, DELETE, BULK_DELETE, ASSIGN_ROLE, etc.
- **Metadata Storage**: JSONB field for flexible data storage
- **Timeline View**: Visual timeline of all activities

### 4. User Settings

- **Profile Management**: Edit name, bio, phone, address
- **Security Settings**: Change password with current password verification
- **Session Management**: View and revoke active sessions

## Database Schema

### New Tables

#### `audit_logs`

```sql
- id: UUID (primary key)
- userId: UUID (foreign key → users.id)
- action: enum (CREATE, UPDATE, DELETE, BULK_DELETE, ASSIGN_ROLE, BULK_ASSIGN_ROLE, PASSWORD_CHANGE, LOGIN, LOGOUT)
- entityType: enum (USER, ROLE, PERMISSION)
- entityId: UUID
- metadata: JSONB
- ipAddress: VARCHAR(45)
- userAgent: TEXT
- createdAt: TIMESTAMP
```

#### `user_profiles`

```sql
- id: UUID (primary key)
- userId: UUID (foreign key → users.id, unique)
- bio: TEXT
- phone: VARCHAR(20)
- address: TEXT
- preferences: JSONB (default: {})
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

#### `user_sessions`

```sql
- id: UUID (primary key)
- userId: UUID (foreign key → users.id)
- token: VARCHAR(255) (unique)
- ipAddress: VARCHAR(45)
- userAgent: TEXT
- lastActive: TIMESTAMP
- createdAt: TIMESTAMP
- expiresAt: TIMESTAMP
```

#### Modified `roles` table

```sql
- Added parentRoleId: UUID (foreign key → roles.id)
  - Enables role hierarchy
  - Supports permission inheritance
```

## API Endpoints

### Admin Users API

#### GET `/api/admin/users`

List all users with pagination, search, and filtering.

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 10)
- `search` (searches in name, email)
- `role` (filter by role ID)
- `sortBy` (default: createdAt)
- `sortOrder` (default: desc)

**Response:**

```json
{
  "users": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "roleName": "Admin",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### POST `/api/admin/users`

Create a new user.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "User Name",
  "roleId": "uuid"
}
```

#### GET `/api/admin/users/:id`

Get user by ID.

#### PATCH `/api/admin/users/:id`

Update user details.

**Body:** (all optional)

```json
{
  "name": "Updated Name",
  "roleId": "uuid"
}
```

#### DELETE `/api/admin/users/:id`

Delete a user.

- Cannot delete your own account

#### POST `/api/admin/users/bulk`

Bulk operations on users.

**Body:**

```json
{
  "action": "delete" | "assignRole",
  "userIds": ["uuid1", "uuid2"],
  "roleId": "uuid" (required for assignRole)
}
```

### Admin Roles API

#### GET `/api/admin/roles`

List all roles with permission counts.

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "Admin",
    "description": "Full system access",
    "parentRoleId": "uuid" | null,
    "permissionsCount": 13,
    "usersCount": 5
  }
]
```

#### POST `/api/admin/roles`

Create a new role.

**Body:**

```json
{
  "name": "Editor",
  "description": "Content editing access",
  "parentRoleId": "uuid" | null,
  "permissionIds": ["uuid1", "uuid2"]
}
```

#### GET `/api/admin/roles/:id`

Get role details with inherited permissions.

#### PATCH `/api/admin/roles/:id`

Update role details.

**Body:** (all optional)

```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "parentRoleId": "uuid" | null,
  "permissionIds": ["uuid1", "uuid2"]
}
```

#### DELETE `/api/admin/roles/:id`

Delete a role.

- Cannot delete if users are assigned to it
- Cannot delete if it's a parent to other roles

### Permissions API

#### GET `/api/admin/permissions`

List all permissions grouped by category.

**Response:**

```json
{
  "grouped": {
    "users": [
      {
        "id": "uuid",
        "name": "users:create",
        "description": "Create new users"
      }
    ],
    "roles": [...],
    "system": [...]
  }
}
```

### Audit Logs API

#### GET `/api/admin/audit-logs`

List audit logs with filtering.

**Query Parameters:**

- `userId` (filter by user)
- `action` (filter by action type)
- `entityType` (filter by entity type)
- `limit` (default: 50)

### User Settings API

#### GET `/api/settings/profile`

Get current user's profile.

#### PATCH `/api/settings/profile`

Update current user's profile.

**Body:** (all optional)

```json
{
  "name": "Updated Name",
  "bio": "My bio",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

#### POST `/api/settings/password`

Change password.

**Body:**

```json
{
  "currentPassword": "CurrentPass123!",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

#### GET `/api/settings/sessions`

List active sessions.

#### DELETE `/api/settings/sessions/:id`

Revoke a session.

## Frontend Components

### Admin Components

#### `AdminSidebar`

Navigation sidebar for admin panel.

**Usage:**

```tsx
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main>{children}</main>
    </div>
  );
}
```

#### `DataTable`

Generic data table component using TanStack Table.

**Usage:**

```tsx
import { DataTable } from "@/components/admin/data-table";

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
];

<DataTable columns={columns} data={users} />;
```

#### `UsersTable`

Pre-configured table for users list.

**Usage:**

```tsx
import { UsersTable } from "@/components/admin/users-table";

<UsersTable />;
```

#### `RolesTable`

Pre-configured table for roles list.

**Usage:**

```tsx
import { RolesTable } from "@/components/admin/roles-table";

<RolesTable />;
```

### Profile Components

#### `ProfileForm`

Form for editing user profile.

**Usage:**

```tsx
import { ProfileForm } from "@/components/profile/profile-form";

<ProfileForm />;
```

#### `PasswordChangeForm`

Form for changing password.

**Usage:**

```tsx
import { PasswordChangeForm } from "@/components/profile/password-change-form";

<PasswordChangeForm />;
```

#### `SessionList`

List and manage active sessions.

**Usage:**

```tsx
import { SessionList } from "@/components/profile/session-list";

<SessionList />;
```

## Setup Instructions

### 1. Database Setup

```bash
# Create database
createdb pisky_admin

# Set DATABASE_URL in .env.local
DATABASE_URL=postgresql://user:password@localhost:5432/pisky_admin

# Run migrations
npm run db:push

# Seed permissions
npm run db:seed
```

### 2. Install Dependencies

```bash
npm install @tanstack/react-query react-hook-form @hookform/resolvers date-fns bcrypt
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Access Admin Panel

Navigate to `/admin` - requires authentication and admin role.

## Permissions List

### Users (4)

- `users:create` - Create new users
- `users:read` - View users
- `users:update` - Update user details
- `users:delete` - Delete users

### Roles (4)

- `roles:create` - Create new roles
- `roles:read` - View roles
- `roles:update` - Update role details
- `roles:delete` - Delete roles

### System (3)

- `system:settings` - Modify system settings
- `system:audit` - View audit logs
- `system:permissions` - Manage permissions

### Profile (2)

- `profile:read` - View user profiles
- `profile:update` - Update own profile

## Role Inheritance

Roles can have a parent role, inheriting all permissions from the parent.

**Example:**

```
Admin (all permissions)
  └── Moderator (inherits from Admin)
       └── Editor (inherits from Moderator)
```

If `Editor` has no direct permissions, it inherits all permissions from `Moderator` and `Admin`.

**Circular Reference Prevention:**

```typescript
// This is prevented
Admin → Moderator → Editor → Admin (cycle detected)
```

## Audit Log Actions

All admin actions are automatically logged:

- `CREATE` - User/Role created
- `UPDATE` - User/Role updated
- `DELETE` - User/Role deleted
- `BULK_DELETE` - Multiple users deleted
- `ASSIGN_ROLE` - Role assigned to user
- `BULK_ASSIGN_ROLE` - Role assigned to multiple users
- `PASSWORD_CHANGE` - Password changed
- `LOGIN` - User logged in
- `LOGOUT` - User logged out

## Security Features

1. **Self-Modification Prevention**: Admins cannot modify/delete their own accounts
2. **Password Hashing**: bcrypt with 12 rounds
3. **Session Management**: View and revoke active sessions
4. **IP & User Agent Tracking**: All actions logged with IP and user agent
5. **Role Assignment Protection**: Cannot delete roles with assigned users
6. **Parent Role Protection**: Cannot delete roles that are parents to other roles

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

## Technical Stack

- **Backend**: Next.js 16 App Router, React 19
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Custom auth with role-based permissions
- **Frontend**: React Query, React Hook Form, Zod
- **UI**: Shadcn UI components
- **Styling**: Tailwind CSS

## File Structure

```
features/
├── admin/
│   ├── users/           # User management
│   ├── roles/           # Role management with inheritance
│   └── audit-logs/      # Audit logging
├── auth/
│   └── permissions/     # Permission checking
├── profile/             # User profile settings
└── security/            # Password & session management

app/
├── admin/               # Admin pages
│   ├── users/
│   ├── roles/
│   ├── permissions/
│   └── audit-logs/
├── settings/            # User settings pages
│   ├── profile/
│   └── security/
└── api/
    ├── admin/           # Admin API routes
    └── settings/        # Settings API routes

components/
├── admin/               # Admin components
└── profile/             # Profile components
```
