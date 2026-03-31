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
