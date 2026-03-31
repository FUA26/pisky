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

declare module "next-auth" {
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
