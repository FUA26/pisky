# Auth System Design Document

**Date:** 2026-03-31
**Project:** Pisky
**Status:** Approved
**Reference:** bandanaiera_boilerplate auth system

---

## Overview

Implement sistem autentikasi lengkap untuk Pisky dengan Credentials authentication (Email/Password), Email Verification, Password Reset flow, dan RBAC dengan roles & permissions lengkap.

### Scope

- ✅ Credentials authentication (Email/Password) ONLY
- ✅ Email Verification
- ✅ Forgot Password
- ✅ Reset Password
- ✅ Registration
- ✅ RBAC dengan roles & permissions
- ❌ OAuth (GitHub/Google) - DISABLED

---

## Database Schema

### New Tables

```sql
-- roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50),
  description TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- role_permissions (junction table)
CREATE TABLE role_permissions (
  roleId UUID REFERENCES roles(id) ON DELETE CASCADE,
  permissionId UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (roleId, permissionId)
);

-- verification_tokens
CREATE TABLE verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (token, identifier)
);
```

### Modifications to Existing Tables

```sql
-- Add to users table
ALTER TABLE users ADD COLUMN roleId UUID REFERENCES roles(id);
ALTER TABLE users ADD COLUMN emailVerified TIMESTAMP;
```

---

## File Structure

```
pisky/
├── features/auth/
│   ├── config/
│   │   └── auth.config.ts          # NextAuth v5 config (credentials only)
│   ├── permissions/
│   │   ├── permissions.ts          # Permission definitions
│   │   ├── rbac.ts                 # RBAC utilities
│   │   └── checker.ts              # Permission checker
│   ├── validations/
│   │   └── auth.ts                 # Zod schemas
│   └── types.ts                    # Auth type extensions
├── components/auth/
│   ├── login-form.tsx              # Email/password login
│   ├── register-form.tsx           # Registration form
│   └── password-input.tsx          # Password input with toggle
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   └── verify-email/
│   │       └── page.tsx
│   └── api/auth/
│       ├── register/
│       │   └── route.ts
│       ├── forgot-password/
│       │   └── route.ts
│       ├── reset-password/
│       │   └── route.ts
│       └── verify-email/
│           └── route.ts
├── lib/
│   └── email.ts                    # Mock email service (console.log)
└── middleware.ts                    # Update with RBAC
```

---

## Auth Configuration

### NextAuth Config (Credentials Only)

```typescript
// features/auth/config/auth.config.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // 1. Validate with Zod
        // 2. Find user by email
        // 3. Verify password with bcrypt
        // 4. Return user with role & permissions
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add role & permissions to token
    },
    async session({ session, token }) {
      // Add role & permissions to session
    },
  },
});
```

---

## Auth Flows

### Login Flow

```
User → /login → LoginForm → signIn('credentials')
  → NextAuth → DB (bcrypt verify)
  → JWT (with role + permissions)
  → Session → Redirect to /dashboard
```

### Registration Flow

```
User → /register → RegisterForm → /api/auth/register
  → Validate → Hash password → Create user
  → Generate verification token
  → Console log email
  → Return success
```

### Password Reset Flow

```
User → /forgot-password → Form → /api/auth/forgot-password
  → Generate token → Console log email
User → /reset-password?token=xxx → Form → /api/auth/reset-password
  → Validate token → Update password → Return success
```

### Email Verification Flow

```
User clicks verification link → /verify-email?token=xxx
  → /api/auth/verify-email
  → Validate token → Mark email as verified
  → Return success
```

---

## API Endpoints

| Endpoint                    | Method | Description                         |
| --------------------------- | ------ | ----------------------------------- |
| `/api/auth/[...nextauth]`   | \*     | NextAuth handler (credentials only) |
| `/api/auth/register`        | POST   | User registration                   |
| `/api/auth/forgot-password` | POST   | Request password reset              |
| `/api/auth/reset-password`  | POST   | Reset password with token           |
| `/api/auth/verify-email`    | POST   | Verify email with token             |

---

## RBAC System

### Default Roles

- `admin` - Full access to all features
- `user` - Standard user access (basic permissions)

### Permission Categories

| Category      | Description        |
| ------------- | ------------------ |
| `USER_*`      | User management    |
| `CONTENT_*`   | Content management |
| `FILE_*`      | File management    |
| `SETTINGS_*`  | Settings access    |
| `ANALYTICS_*` | Analytics access   |
| `ADMIN_*`     | Admin operations   |

### Permission Scopes

- `_OWN` - Access own resources only
- `_ANY` - Access any resource (implies OWN permission)

### Server Utilities

```typescript
// features/auth/permissions/permissions.ts
requireAuth()              // Check if authenticated
requirePermission(perm)    // Check specific permission
requireAnyPermission([...]) // Check multiple (OR logic)
```

### Client Hooks

```typescript
// features/auth/permissions/hooks.ts
useCan(permission); // Check permission in UI
useRole(); // Get user's role
usePermissions(); // Get all permissions
```

---

## Email Service (Mock)

```typescript
// lib/email.ts
export async function sendEmail({ to, subject, html }) {
  console.log("=== MOCK EMAIL ===");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${html}`);
  console.log("==================");
}
```

**Email Templates:**

- Welcome email
- Email verification
- Password reset request
- Password reset confirmation

---

## Security Features

- ✅ bcrypt password hashing
- ✅ JWT stateless sessions
- ✅ Token-based password reset (with expiration)
- ✅ Email verification tokens (one-time use)
- ✅ Input validation with Zod
- ✅ Generic error messages (prevent email enumeration)
- ✅ Route protection via middleware
- ✅ RBAC at route and component level
- ✅ CSRF protection via NextAuth

---

## Validation Schemas (Zod)

```typescript
// features/auth/validations/auth.ts
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8).regex(passwordPattern),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword);

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
  confirmPassword: z.string(),
});
```

---

## UI Components

### Auth Forms

- **login-form.tsx** - Email/password login with error handling
- **register-form.tsx** - Registration with password strength
- **password-input.tsx** - Password input with show/hide toggle

### Pages

- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Forgot password form
- `/reset-password` - Reset password form (with token)
- `/verify-email` - Email verification page

---

## Migration & Seeding

### Initial Data

```sql
-- Insert default roles
INSERT INTO roles (id, name, description) VALUES
  ('admin-id', 'admin', 'Administrator with full access'),
  ('user-id', 'user', 'Standard user with basic permissions');

-- Insert permissions (from bandanaiera_boilerplate)
INSERT INTO permissions (name, category, description) VALUES
  -- User permissions
  ('USER_CREATE', 'USER', 'Create new users'),
  ('USER_READ_OWN', 'USER', 'Read own user data'),
  ('USER_READ_ANY', 'USER', 'Read any user data'),
  ('USER_UPDATE_OWN', 'USER', 'Update own user data'),
  ('USER_UPDATE_ANY', 'USER', 'Update any user data'),
  -- ... more permissions

-- Assign permissions to admin role
INSERT INTO role_permissions (roleId, permissionId)
SELECT 'admin-id', id FROM permissions;
```

---

## Dependencies

Already installed in Pisky:

- `next-auth@beta` - NextAuth.js v5
- `bcryptjs` - Password hashing
- `zod` - Validation
- `drizzle-orm` - Database ORM

Need to add:

- `@types/bcryptjs` - TypeScript types for bcryptjs

---

## Success Criteria

- [ ] User can register with email/password
- [ ] User can login with email/password
- [ ] User receives (console) email for verification
- [ ] User can verify email
- [ ] User can request password reset
- [ ] User can reset password with token
- [ ] Protected routes require authentication
- [ ] RBAC permissions are enforced
- [ ] Session includes role and permissions
- [ ] All forms have proper validation
- [ ] Error messages are user-friendly

---

## Notes

- OAuth providers (GitHub/Google) are disabled but can be added later
- Email service is mocked (console.log) - can be replaced with real service
- Password reset tokens expire after 1 hour
- Email verification tokens expire after 24 hours
- Default admin user can be created via seeding script
