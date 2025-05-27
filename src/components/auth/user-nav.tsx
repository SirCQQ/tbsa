"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  User,
  Settings,
  LogOut,
  Building2,
  Home,
  Shield,
  ChevronDown,
  Building,
} from "lucide-react";
import { useSession, useLogout } from "@/hooks/use-auth";
import { useAuthFeedback } from "@/hooks/use-auth-feedback";

interface UserNavProps {
  onLogout?: () => void;
}

export function UserNav({ onLogout }: UserNavProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const { mutate: logout } = useLogout();
  const { showLogoutSuccess, showAuthError } = useAuthFeedback();

  const user = session?.user;

  if (!user) {
    return null;
  }

  const userInitials =
    user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : user.firstName
      ? user.firstName[0]
      : user.lastName
      ? user.lastName[0]
      : user.email[0];

  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || user.email;

  const isAdmin = user.role === "ADMINISTRATOR";
  const isOwner = user.role === "OWNER";

  const roleInfo = {
    label: isAdmin ? "Administrator" : "Proprietar",
    variant: isAdmin ? ("default" as const) : ("secondary" as const),
    description: isAdmin
      ? "Acces complet la sistem și gestionare utilizatori"
      : "Gestionare apartamente și citiri de consum",
  };

  const RoleIcon = isAdmin ? Shield : Home;

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      await logout();

      showLogoutSuccess();

      if (onLogout) {
        onLogout();
      }

      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      showAuthError(
        "A apărut o eroare la deconectare. Te rugăm să încerci din nou.",
        "Eroare la deconectare"
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDashboardClick = () => {
    router.push("/dashboard");
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const handleSettingsClick = () => {
    // TODO: Implement settings page
    console.log("Navigate to settings");
  };

  const handleApartmentsClick = () => {
    router.push("/dashboard/apartments");
  };

  const handleBuildingsClick = () => {
    router.push("/dashboard/admin/buildings");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-auto px-3 py-2 hover:bg-accent"
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {user.firstName?.[0]?.toUpperCase() || "U"}
                {user.lastName?.[0]?.toUpperCase() || ""}
              </AvatarFallback>
            </Avatar>

            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium leading-none">
                {displayName}
              </span>
              <div className="flex items-center space-x-1 mt-1">
                <RoleIcon className="h-3 w-3" />
                <span className="text-xs text-muted-foreground">
                  {roleInfo.label}
                </span>
              </div>
            </div>

            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {user.firstName?.[0]?.toUpperCase() || "U"}
                  {user.lastName?.[0]?.toUpperCase() || ""}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">
                  {displayName}
                </p>
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant={roleInfo.variant} className="text-xs">
                <RoleIcon className="h-3 w-3 mr-1" />
                {roleInfo.label}
              </Badge>
              {user.phone && (
                <span className="text-xs text-muted-foreground">
                  {user.phone}
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {roleInfo.description}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDashboardClick}>
          <Building2 className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>

        {(isOwner || isAdmin) && (
          <DropdownMenuItem onClick={handleApartmentsClick}>
            <Home className="mr-2 h-4 w-4" />
            <span>Apartamentele Mele</span>
          </DropdownMenuItem>
        )}

        {isAdmin && (
          <DropdownMenuItem onClick={handleBuildingsClick}>
            <Building className="mr-2 h-4 w-4" />
            <span>Managementul Clădirilor</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handleProfileClick}>
          <User className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleSettingsClick}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Setări</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-red-600 dark:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Se deconectează..." : "Deconectare"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
