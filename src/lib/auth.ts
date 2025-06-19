import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type {
  PermissionString,
  RoleString,
  UserOrganizationWithDetails,
} from "@/types/next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
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

        // Collect all permissions from roles and direct assignments
        const rolePermissions: PermissionString[] = user.roles.flatMap(
          (userRole) =>
            userRole.role.rolePermissions.map((rp) => ({
              id: rp.permission.id,
              code: rp.permission.code,
              name: rp.permission.name,
              resource: rp.permission.resource,
              action: rp.permission.action,
              description: rp.permission.description,
            }))
        );

        const directPermissions: PermissionString[] = user.organizations
          .filter((org) => org.permission)
          .map((org) => ({
            id: org.permission!.id,
            code: org.permission!.code,
            name: org.permission!.name,
            resource: org.permission!.resource,
            action: org.permission!.action,
            description: org.permission!.description,
          }));

        // Combine and deduplicate permissions
        const allPermissions = [...rolePermissions, ...directPermissions];
        const uniquePermissions = allPermissions.filter(
          (permission, index, self) =>
            index === self.findIndex((p) => p.code === permission.code)
        );

        // Map organizations
        const organizations: UserOrganizationWithDetails[] =
          user.organizations.map((org) => ({
            id: org.organization.id,
            name: org.organization.name,
            code: org.organization.code,
            description: org.organization.description,
          }));

        // Map roles
        const roles: RoleString[] = user.roles.map((userRole) => ({
          id: userRole.role.id,
          code: userRole.role.code,
          name: userRole.role.name,
          description: userRole.role.description,
        }));

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

          // Get permissions for OAuth user
          const rolePermissions: PermissionString[] = dbUser.roles.flatMap(
            (userRole) =>
              userRole.role.rolePermissions.map((rp) => ({
                id: rp.permission.id,
                code: rp.permission.code,
                name: rp.permission.name,
                resource: rp.permission.resource,
                action: rp.permission.action,
                description: rp.permission.description,
              }))
          );

          const directPermissions: PermissionString[] = dbUser.organizations
            .filter((org) => org.permission)
            .map((org) => ({
              id: org.permission!.id,
              code: org.permission!.code,
              name: org.permission!.name,
              resource: org.permission!.resource,
              action: org.permission!.action,
              description: org.permission!.description,
            }));

          const allPermissions = [...rolePermissions, ...directPermissions];
          const uniquePermissions = allPermissions.filter(
            (permission, index, self) =>
              index === self.findIndex((p) => p.code === permission.code)
          );

          const organizations: UserOrganizationWithDetails[] =
            dbUser.organizations.map((org) => ({
              id: org.organization.id,
              name: org.organization.name,
              code: org.organization.code,
              description: org.organization.description,
            }));

          const roles: RoleString[] = dbUser.roles.map((userRole) => ({
            id: userRole.role.id,
            code: userRole.role.code,
            name: userRole.role.name,
            description: userRole.role.description,
          }));

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
