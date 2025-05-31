import { NextRequest, NextResponse } from "next/server";
import { PermissionService } from "@/services/permission.service";
import { getCurrentUser } from "@/services/auth-server.service";
import { mapUsersToApiResponse } from "@/lib/mappers/user.mapper";

export async function GET() {
  try {
    // Get current user
    const { user: currentUser, isAuthenticated } = await getCurrentUser();
    if (!isAuthenticated || !currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get all users with their roles
    const users = await PermissionService.getAllUsersWithRoles(currentUser.id);

    return NextResponse.json({
      users: mapUsersToApiResponse(users),
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Get current user
    const { user: currentUser, isAuthenticated } = await getCurrentUser();
    if (!isAuthenticated || !currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { userId, roleId } = body;

    if (!userId || !roleId) {
      return NextResponse.json(
        { error: "userId and roleId are required" },
        { status: 400 }
      );
    }

    // Assign role to user
    await PermissionService.assignRoleToUser(currentUser.id, userId, roleId);

    return NextResponse.json({
      message: "Role assigned successfully",
    });
  } catch (error) {
    console.error("Assign role error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
