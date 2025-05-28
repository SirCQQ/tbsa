import { prisma } from "@/lib/prisma";
import type { Permission, Role } from "@prisma/client";
import { PermissionString } from "@/lib/constants";

export type PermissionResource =
  | "buildings"
  | "apartments"
  | "users"
  | "water_readings"
  | "invite_codes"
  | "roles"
  | "admin_grant";

export type PermissionAction = "read" | "create" | "update" | "delete";

export type PermissionScope = "all" | "own" | "building" | null;

export type PermissionCheck = {
  resource: PermissionResource;
  action: PermissionAction;
  scope?: PermissionScope;
};

export type UserPermissions = {
  userId: string;
  roleName: string;
  permissions: Permission[];
};

export type UserWithRole = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  role: {
    id: string;
    name: string;
    description: string | null;
  };
};

export type UserWithRoleAndProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  role: {
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
  };
  administrator: {
    id: string;
  } | null;
  owner: {
    id: string;
    apartments: {
      id: string;
      number: string;
      building: {
        name: string;
      };
    }[];
  } | null;
};

export class PermissionService {
  /**
   * Get user permissions
   */
  static async getUserPermissions(
    userId: string
  ): Promise<UserPermissions | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const permissions = user.role.permissions.map((rp) => rp.permission);

    return {
      userId: user.id,
      roleName: user.role.name,
      permissions,
    };
  }

  /**
   * Check if a user has a specific permission
   */
  static async hasPermission(
    userId: string,
    check: PermissionCheck
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);

    if (!userPermissions) {
      return false;
    }

    // SUPER_ADMIN has all permissions
    if (userPermissions.roleName === "SUPER_ADMIN") {
      return true;
    }

    // Check if user has the specific permission
    return userPermissions.permissions.some(
      (permission) =>
        permission.resource === check.resource &&
        permission.action === check.action &&
        (check.scope === undefined || permission.scope === check.scope)
    );
  }

  /**
   * Check multiple permissions at once
   */
  static async hasAnyPermission(
    userId: string,
    checks: PermissionCheck[]
  ): Promise<boolean> {
    for (const check of checks) {
      if (await this.hasPermission(userId, check)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if user has all specified permissions
   */
  static async hasAllPermissions(
    userId: string,
    checks: PermissionCheck[]
  ): Promise<boolean> {
    for (const check of checks) {
      if (!(await this.hasPermission(userId, check))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get user's role name
   */
  static async getUserRole(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
      },
    });

    return user ? user.role.name : null;
  }

  /**
   * Get user permissions as string array for JWT
   */
  static async getUserPermissionStrings(
    userId: string
  ): Promise<PermissionString[]> {
    const userPermissions = await this.getUserPermissions(userId);

    if (!userPermissions) {
      return [];
    }

    // SUPER_ADMIN gets all permissions
    if (userPermissions.roleName === "SUPER_ADMIN") {
      const allPermissions = await this.getAllPermissions();
      return allPermissions.map(
        (p) =>
          `${p.resource}:${p.action}:${p.scope || "null"}` as PermissionString
      );
    }

    // Convert permissions to string format
    return userPermissions.permissions.map(
      (p) =>
        `${p.resource}:${p.action}:${p.scope || "null"}` as PermissionString
    );
  }

  /**
   * Check if user has permission using permission strings array
   */
  static hasPermissionFromString(
    permissions: string[],
    check: PermissionCheck
  ): boolean {
    const permissionString = `${check.resource}:${check.action}:${
      check.scope || "null"
    }`;
    return permissions.includes(permissionString);
  }

  /**
   * Check if user can access a specific building
   */
  static async canAccessBuilding(
    userId: string,
    buildingId: string
  ): Promise<boolean> {
    // Check if user has permission to read all buildings (admin)
    if (
      await this.hasPermission(userId, {
        resource: "buildings",
        action: "read",
        scope: "all",
      })
    ) {
      return true;
    }

    // Check if user has permission to read own buildings (administrator)
    if (
      await this.hasPermission(userId, {
        resource: "buildings",
        action: "read",
        scope: "own",
      })
    ) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          administrator: {
            include: {
              buildings: true,
            },
          },
        },
      });

      return (
        user?.administrator?.buildings.some((b) => b.id === buildingId) || false
      );
    }

    // Check if user has permission to read building-scoped data (owner)
    if (
      await this.hasPermission(userId, {
        resource: "apartments",
        action: "read",
        scope: "own",
      })
    ) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          owner: {
            include: {
              apartments: {
                include: {
                  building: true,
                },
              },
            },
          },
        },
      });

      return (
        user?.owner?.apartments.some((a) => a.building.id === buildingId) ||
        false
      );
    }

    return false;
  }

  /**
   * Check if user can access a specific apartment
   */
  static async canAccessApartment(
    userId: string,
    apartmentId: string
  ): Promise<boolean> {
    // Check if user has permission to read all apartments (admin)
    if (
      await this.hasPermission(userId, {
        resource: "apartments",
        action: "read",
        scope: "all",
      })
    ) {
      return true;
    }

    // Get apartment with building info
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      include: {
        building: true,
        owner: true,
      },
    });

    if (!apartment) {
      return false;
    }

    // Check if user has permission to read building-scoped apartments (administrator)
    if (
      await this.hasPermission(userId, {
        resource: "apartments",
        action: "read",
        scope: "building",
      })
    ) {
      return this.canAccessBuilding(userId, apartment.building.id);
    }

    // Check if user has permission to read own apartments (owner)
    if (
      await this.hasPermission(userId, {
        resource: "apartments",
        action: "read",
        scope: "own",
      })
    ) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          owner: true,
        },
      });

      return user?.owner?.id === apartment.ownerId;
    }

    return false;
  }

  /**
   * Create a new role with permissions (requires admin_grant permission)
   */
  static async createRole(
    createdBy: string,
    roleName: string,
    description: string,
    permissionIds: string[]
  ): Promise<Role | null> {
    // Check if user has permission to create roles
    if (
      !(await this.hasPermission(createdBy, {
        resource: "roles",
        action: "create",
        scope: "all",
      }))
    ) {
      throw new Error("Insufficient permissions to create roles");
    }

    // Create role
    const role = await prisma.role.create({
      data: {
        name: roleName,
        description,
        isSystem: false,
      },
    });

    // Assign permissions
    for (const permissionId of permissionIds) {
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId,
        },
      });
    }

    return role;
  }

  /**
   * Get all available permissions
   */
  static async getAllPermissions(): Promise<Permission[]> {
    return prisma.permission.findMany({
      orderBy: [{ resource: "asc" }, { action: "asc" }, { scope: "asc" }],
    });
  }

  /**
   * Get all roles with their permissions
   */
  static async getAllRoles(): Promise<
    (Role & { permissions: Permission[] })[]
  > {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return roles.map((role) => ({
      ...role,
      permissions: role.permissions.map((rp) => rp.permission),
    }));
  }

  /**
   * Assign a role to a user (requires admin_grant permission)
   */
  static async assignRoleToUser(
    assignedBy: string,
    userId: string,
    roleId: string
  ): Promise<boolean> {
    // Check if user has permission to assign roles
    if (
      !(await this.hasPermission(assignedBy, {
        resource: "admin_grant",
        action: "create",
        scope: "all",
      }))
    ) {
      throw new Error("Insufficient permissions to assign roles");
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new Error("Role not found");
    }

    // Update user's role
    await prisma.user.update({
      where: { id: userId },
      data: { roleId },
    });

    return true;
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(roleId: string): Promise<UserWithRole[]> {
    return prisma.user.findMany({
      where: { roleId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Get all users with their roles (SUPER_ADMIN and ADMINISTRATOR only)
   */
  static async getAllUsersWithRoles(
    requesterId: string
  ): Promise<UserWithRoleAndProfile[]> {
    // Check permissions
    const hasPermission = await this.hasPermission(requesterId, {
      resource: "users",
      action: "read",
      scope: "all",
    });

    if (!hasPermission) {
      throw new Error("Insufficient permissions to view all users");
    }

    return prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            isSystem: true,
          },
        },
        administrator: {
          select: {
            id: true,
          },
        },
        owner: {
          select: {
            id: true,
            apartments: {
              select: {
                id: true,
                number: true,
                building: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
