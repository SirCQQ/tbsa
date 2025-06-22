"use client";

import {
  PermissionGuard,
  PermissionGuardOr,
  PermissionGuardAnd,
  usePermissions,
} from "./permission-guard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, Settings, Shield } from "lucide-react";

/**
 * Examples of how to use the PermissionGuard component
 */

// Example 1: Basic OR permissions (user needs ANY one of these permissions)
export function ExampleOrPermissions() {
  return (
    <PermissionGuardOr
      permissions={["buildings:read", "buildings:create", "buildings:update"]}
      fallback={
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You need at least one building permission to view this content.
          </AlertDescription>
        </Alert>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Building Management
          </CardTitle>
          <CardDescription>
            You can see this because you have at least one building permission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This content is visible to users with any building permission.</p>
        </CardContent>
      </Card>
    </PermissionGuardOr>
  );
}

// Example 2: Basic AND permissions (user needs ALL of these permissions)
export function ExampleAndPermissions() {
  return (
    <PermissionGuardAnd
      permissions={["users:read", "users:create", "users:update"]}
      fallback={
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You need all user management permissions to view this content.
          </AlertDescription>
        </Alert>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Full User Management
          </CardTitle>
          <CardDescription>
            You can see this because you have all required user permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This content requires full user management access.</p>
        </CardContent>
      </Card>
    </PermissionGuardAnd>
  );
}

// Example 3: Combined OR and AND permissions
export function ExampleCombinedPermissions() {
  return (
    <PermissionGuard
      orPermissions={["buildings:read", "apartments:read"]} // User needs at least one of these
      andPermissions={["users:read", "organizations:read"]} // AND all of these
      fallback={
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You need property access (buildings OR apartments) AND
            user/organization read permissions.
          </AlertDescription>
        </Alert>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Management Panel
          </CardTitle>
          <CardDescription>
            Complex permission requirements: (buildings:read OR apartments:read)
            AND (users:read AND organizations:read)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            This content requires both property access and user management
            permissions.
          </p>
        </CardContent>
      </Card>
    </PermissionGuard>
  );
}

// Example 4: With redirect on permission failure
export function ExampleWithRedirect() {
  return (
    <PermissionGuard
      orPermissions={["admin:access", "super_admin:access"]}
      withRedirect={true}
      redirectUrl="/auth/login?error=insufficient_permissions"
    >
      <Card>
        <CardHeader>
          <CardTitle>Admin Only Content</CardTitle>
          <CardDescription>
            If you don&apos;t have admin access, you&apos;ll be redirected to
            login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This content is only for administrators.</p>
        </CardContent>
      </Card>
    </PermissionGuard>
  );
}

// Example 5: With custom loading state
export function ExampleWithLoading() {
  return (
    <PermissionGuard
      orPermissions={["buildings:read"]}
      loading={
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      }
      fallback={
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don&apos;t have permission to view buildings.
          </AlertDescription>
        </Alert>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Buildings List</CardTitle>
          <CardDescription>
            This shows a custom loading state while permissions are being
            checked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Building data would be displayed here.</p>
        </CardContent>
      </Card>
    </PermissionGuard>
  );
}

// Example 6: Using the usePermissions hook for conditional rendering
export function ExampleUsingHook() {
  const { hasAnyPermission, hasAllPermissions, hasExactPermissions } =
    usePermissions();

  const canManageBuildings = hasAnyPermission([
    "buildings:create",
    "buildings:update",
    "buildings:delete",
  ]);
  const canFullyManageUsers = hasAllPermissions([
    "users:read",
    "users:create",
    "users:update",
    "users:delete",
  ]);
  const canAccessDashboard = hasExactPermissions(
    ["buildings:read", "apartments:read"], // OR permissions
    ["organizations:read"] // AND permissions
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Status Dashboard</CardTitle>
        <CardDescription>
          Using the usePermissions hook to check permissions programmatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg border">
            <h4 className="font-medium">Building Management</h4>
            <p className="text-sm text-muted-foreground">
              {canManageBuildings ? "✅ Allowed" : "❌ Denied"}
            </p>
          </div>

          <div className="p-3 rounded-lg border">
            <h4 className="font-medium">Full User Management</h4>
            <p className="text-sm text-muted-foreground">
              {canFullyManageUsers ? "✅ Allowed" : "❌ Denied"}
            </p>
          </div>

          <div className="p-3 rounded-lg border">
            <h4 className="font-medium">Dashboard Access</h4>
            <p className="text-sm text-muted-foreground">
              {canAccessDashboard ? "✅ Allowed" : "❌ Denied"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {canManageBuildings && (
            <Button className="w-full">
              <Building2 className="h-4 w-4 mr-2" />
              Manage Buildings
            </Button>
          )}

          {canFullyManageUsers && (
            <Button variant="secondary" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Full User Management
            </Button>
          )}

          {canAccessDashboard && (
            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Access Dashboard
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Example 7: Nested permission guards
export function ExampleNestedGuards() {
  return (
    <PermissionGuardOr
      permissions={["organizations:read"]}
      fallback={
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You need organization read permission to view this section.
          </AlertDescription>
        </Alert>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Organization Dashboard</CardTitle>
          <CardDescription>
            You have organization access. Some features may require additional
            permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Basic organization information is visible to all users with
            organization:read.
          </p>

          {/* Nested guard for admin features */}
          <PermissionGuardAnd
            permissions={["organizations:update", "users:read"]}
            fallback={
              <Alert>
                <AlertDescription>
                  Additional admin features require organization:update AND
                  users:read permissions.
                </AlertDescription>
              </Alert>
            }
          >
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Admin Features</h4>
              <p className="text-sm text-muted-foreground">
                You can see these admin features because you have both
                organization:update and users:read permissions.
              </p>
              <Button size="sm" className="mt-2">
                Advanced Settings
              </Button>
            </div>
          </PermissionGuardAnd>
        </CardContent>
      </Card>
    </PermissionGuardOr>
  );
}
