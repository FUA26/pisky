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
