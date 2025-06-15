import NextAuth, { DefaultSession } from "next-auth";
import { Administrator, Owner } from "@prisma/client/wasm";
import { PermissionString } from "@/lib/constants";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      administrator: Administrator | null;
      owner: Owner | null;
      ownerId: string | null;
      permissions: PermissionString[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    firstName: string;
    lastName: string;
    administrator: Administrator | null;
    owner: Owner | null;
    ownerId: string | null;
    permissions: PermissionString[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    administratorId: string | null;
    ownerId: string | null;
    permissions: PermissionString[];
  }
}
