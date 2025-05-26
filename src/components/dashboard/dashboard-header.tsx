"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Building2, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import type { SafeUser } from "@/types/auth";

type DashboardHeaderProps = {
  user: SafeUser;
};

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = user.role === "ADMINISTRATOR";
  const isOnAdminDashboard = pathname.startsWith("/dashboard/admin");

  const handleDashboardSwitch = () => {
    if (isOnAdminDashboard) {
      router.push("/dashboard");
    } else {
      router.push("/dashboard/admin");
    }
  };

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 md:mt-2 text-sm md:text-base">
            Bun venit, {user.firstName} {user.lastName}!
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge
              variant={isAdmin ? "default" : "secondary"}
              className="text-xs"
            >
              {isAdmin ? "Administrator" : "Proprietar"}
            </Badge>
            {isOnAdminDashboard && (
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800 text-xs"
              >
                Vizualizare Admin
              </Badge>
            )}
            {!isOnAdminDashboard && isAdmin && (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800 text-xs"
              >
                Vizualizare Proprietar
              </Badge>
            )}
          </div>
        </div>

        {/* Dashboard Switch for Administrators */}
        {isAdmin && (
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:gap-3 sm:space-y-0">
            <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              Schimbă vizualizarea:
            </div>
            <Button
              onClick={handleDashboardSwitch}
              variant="outline"
              size="default"
              className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 min-h-[44px] sm:min-h-[40px] px-4 py-2 active:scale-95 touch-manipulation"
            >
              {isOnAdminDashboard ? (
                <>
                  <User className="h-4 w-4" />
                  <span className="font-medium text-sm">Proprietar</span>
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium text-sm">Administrator</span>
                </>
              )}
              <ArrowRightLeft className="h-3 w-3 opacity-60" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
