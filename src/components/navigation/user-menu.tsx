"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getUserRole = () => {
    if (!user.permissions || user.permissions.length === 0) return "User";

    const hasAdminGrant = user.permissions.some((p) =>
      p.includes("admin_grant:create:all")
    );
    if (hasAdminGrant) return "Super Admin";

    const hasAdminPerms = user.permissions.some(
      (p) =>
        p.includes(":read:all") ||
        p.includes(":create:all") ||
        p.includes(":update:all")
    );
    if (hasAdminPerms) return "Admin";

    const hasBuildingPerms = user.permissions.some(
      (p) => p.includes("buildings:") || p.includes("apartments:")
    );
    if (hasBuildingPerms) return "Building Admin";

    return "User";
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Super Admin":
        return "destructive" as const;
      case "Admin":
        return "default" as const;
      case "Building Admin":
        return "secondary" as const;
      default:
        return "outline-solid" as const;
    }
  };

  const userRole = getUserRole();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-sm">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <Badge
              variant={getRoleBadgeVariant(userRole)}
              className="w-fit text-xs"
            >
              {userRole}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <PermissionGuard permissions={["users:update:own"]}>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </Link>
          </DropdownMenuItem>
        </PermissionGuard>
        <PermissionGuard permissions={["users:update:own"]}>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Setări</span>
            </Link>
          </DropdownMenuItem>
        </PermissionGuard>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
