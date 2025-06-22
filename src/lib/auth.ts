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
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.isVerified = user.isVerified || false;
        token.permissions = user.permissions || [];
        token.organizations = user.organizations || [];
        token.roles = user.roles || [];
        token.currentOrganizationId = user.currentOrganizationId || null;
      }

      // Handle session updates (organization switching, etc.)
      if (trigger === "update" && session) {
        if (session.currentOrganizationId) {
          token.currentOrganizationId = session.currentOrganizationId;
        }
      }

      // Handle Google OAuth users
      if (token.email && !token.firstName && !token.lastName) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
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
          token.id = dbUser.id;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.isVerified = dbUser.isVerified;

          // Get permission codes for OAuth user
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

          const organizations: OrganizationReference[] =
            dbUser.organizations.map((org) => ({
              id: org.organization.id,
              name: org.organization.name,
              code: org.organization.code,
            }));

          const roles: RoleCode[] = dbUser.roles.map(
            (userRole) => userRole.role.code
          );

          token.permissions = uniquePermissions;
          token.organizations = organizations;
          token.roles = roles;
          token.currentOrganizationId = organizations[0]?.id || null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.isVerified = token.isVerified;
        session.user.permissions = token.permissions;
        session.user.organizations = token.organizations;
        session.user.roles = token.roles;
        session.user.currentOrganizationId = token.currentOrganizationId;
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
  debug: process.env.NODE_ENV === "development",
};
