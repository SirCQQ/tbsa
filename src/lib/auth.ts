import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { RoleCode, OrganizationReference } from "@/types/next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        // Find user with all necessary relations
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            organizations: {
              include: {
                organization: true,
                permission: true,
              },
            },
            roles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        if (!user.isActive) {
          throw new Error("Account is disabled");
        }

        // Verify password
        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Collect permission codes only
        const rolePermissionCodes: string[] = user.roles.flatMap((userRole) =>
          userRole.role.rolePermissions.map((rp) => rp.permission.code)
        );

        const directPermissionCodes: string[] = user.organizations
          .filter((org) => org.permission)
          .map((org) => org.permission!.code);

        // Combine and deduplicate permission codes
        const allPermissionCodes = [
          ...rolePermissionCodes,
          ...directPermissionCodes,
        ];
        const uniquePermissions = [...new Set(allPermissionCodes)];

        // Map organizations to minimal data
        const organizations: OrganizationReference[] = user.organizations.map(
          (org) => ({
            id: org.organization.id,
            name: org.organization.name,
            code: org.organization.code,
          })
        );

        // Map role codes only
        const roles: RoleCode[] = user.roles.map(
          (userRole) => userRole.role.code
        );

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified,
          permissions: uniquePermissions,
          organizations,
          roles,
          currentOrganizationId: organizations[0]?.id || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // If this is the first time the jwt callback is run (user login)
      if (user) {
        // Get fresh user data with relations from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            organizations: {
              include: {
                organization: true,
                permission: true,
              },
            },
            roles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (dbUser) {
          // Collect permission codes
          const rolePermissionCodes: string[] = dbUser.roles.flatMap(
            (userRole) =>
              userRole.role.rolePermissions.map((rp) => rp.permission.code)
          );

          const directPermissionCodes: string[] = dbUser.organizations
            .filter((org) => org.permission)
            .map((org) => org.permission!.code);

          const allPermissionCodes = [
            ...rolePermissionCodes,
            ...directPermissionCodes,
          ];
          const uniquePermissions = [...new Set(allPermissionCodes)];

          // Map organizations
          const organizations: OrganizationReference[] =
            dbUser.organizations.map((org) => ({
              id: org.organization.id,
              name: org.organization.name,
              code: org.organization.code,
            }));

          // Map role codes
          const roles: RoleCode[] = dbUser.roles.map(
            (userRole) => userRole.role.code
          );

          // Store all data in the token
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.isVerified = dbUser.isVerified;
          token.permissions = uniquePermissions;
          token.organizations = organizations;
          token.roles = roles;
          token.currentOrganizationId = organizations[0]?.id || null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        // Copy data from token to session
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.permissions = token.permissions as string[];
        session.user.organizations =
          token.organizations as OrganizationReference[];
        session.user.roles = token.roles as RoleCode[];
        session.user.currentOrganizationId = token.currentOrganizationId as
          | string
          | null;
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign in
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Extract name from Google profile or user name
            const googleProfile = profile as any;
            const firstName =
              googleProfile?.given_name || user.name?.split(" ")[0] || "";
            const lastName =
              googleProfile?.family_name ||
              user.name?.split(" ").slice(1).join(" ") ||
              "";

            // Create new user for Google OAuth
            await prisma.user.create({
              data: {
                email: user.email!,
                firstName,
                lastName,
                password: "", // Empty password for OAuth users
                isVerified: true, // Google accounts are pre-verified
                emailVerified: new Date(),
                image: user.image,
              },
            });
          } else {
            // Update existing user with OAuth info if needed
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                emailVerified: new Date(),
                image: user.image,
                isVerified: true,
              },
            });
          }
          return true;
        } catch (error) {
          console.error("Error in Google sign in callback:", error);
          return false;
        }
      }

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};
