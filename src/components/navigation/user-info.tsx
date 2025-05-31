"use client";

import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function UserInfo() {
  const { user } = useAuth();

  if (!user) return null;

  const initials = `${user.firstName?.[0] || ""}${
    user.lastName?.[0] || ""
  }`.toUpperCase();

  // Determine role based on permissions
  const getDisplayRole = () => {
    if (!user.permissions || user.permissions.length === 0) return "User";

    // Check for super admin permissions
    if (user.permissions.includes("admin_grant:create:all")) {
      return "Super Admin";
    }

    // Check for admin permissions
    if (user.permissions.some((p) => p.includes(":all"))) {
      return "Admin";
    }

    // Check for building admin permissions
    if (user.permissions.some((p) => p.includes(":building"))) {
      return "Building Admin";
    }

    return "User";
  };

  const displayRole = getDisplayRole();

  return (
    <div className="flex items-center space-x-3">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="text-sm">{initials || "U"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium truncate">
            {user.firstName} {user.lastName}
          </p>
          <Badge variant="secondary" className="text-xs">
            {displayRole}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>
    </div>
  );
}
