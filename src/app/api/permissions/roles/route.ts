import { NextRequest, NextResponse } from "next/server";
import { PermissionService } from "@/services/permission.service";
import { getCurrentUser } from "@/services/auth-server.service";
import {
  mapRolesToApiResponse,
  mapPermissionsToApiResponse,
  mapRoleToApiResponse,
} from "@/lib/mappers/role.mapper";

export async function GET(req: NextRequest) {
  try {
    // Get current user
    const { user: currentUser, isAuthenticated } = await getCurrentUser();
    if (!isAuthenticated || !currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user can view roles (only SUPER_ADMIN and ADMINISTRATOR)
    const canViewRoles = await PermissionService.hasPermission(currentUser.id, {
      resource: "roles",
      action: "read",
      scope: "all",
    });

    if (!canViewRoles) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get all roles and permissions
    const roles = await PermissionService.getAllRoles();
    const permissions = await PermissionService.getAllPermissions();

    return NextResponse.json({
      roles: mapRolesToApiResponse(roles),
      allPermissions: mapPermissionsToApiResponse(permissions),
    });
  } catch (error) {
    console.error("Get roles error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get current user
    const { user: currentUser, isAuthenticated } = await getCurrentUser();
    if (!isAuthenticated || !currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user can create roles (only SUPER_ADMIN)
    const canCreateRoles = await PermissionService.hasPermission(
      currentUser.id,
      {
        resource: "roles",
        action: "create",
        scope: "all",
      }
    );

    if (!canCreateRoles) {
      return NextResponse.json(
        {
          error: "Insufficient permissions. Only SUPER_ADMIN can create roles.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, description, permissionIds } = body;

    if (!name || !description || !Array.isArray(permissionIds)) {
      return NextResponse.json(
        { error: "Name, description, and permissionIds array are required" },
        { status: 400 }
      );
    }

    // Validate permission IDs exist
    const allPermissions = await PermissionService.getAllPermissions();
    const validPermissionIds = allPermissions.map((p) => p.id);
    const invalidIds = permissionIds.filter(
      (id) => !validPermissionIds.includes(id)
    );

    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: `Invalid permission IDs: ${invalidIds.join(", ")}` },
        { status: 400 }
      );
    }

    // Create the role
    const newRole = await PermissionService.createRole(
      currentUser.id,
      name,
      description,
      permissionIds
    );

    if (!newRole) {
      return NextResponse.json(
        { error: "Failed to create role" },
        { status: 500 }
      );
    }

    // Get the created role with permissions
    const roles = await PermissionService.getAllRoles();
    const createdRole = roles.find((r) => r.id === newRole.id);

    return NextResponse.json(
      {
        message: "Role created successfully",
        role: mapRoleToApiResponse(createdRole!),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create role error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
