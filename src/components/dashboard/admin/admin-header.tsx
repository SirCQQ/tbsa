"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { User, ArrowRightLeft } from "lucide-react";
import type { SafeUser } from "@/types/auth";

type AdminHeaderProps = {
  user: SafeUser;
};

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();

  const handleDashboardSwitch = () => {
    router.push("/dashboard");
  };

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Panou Administrator
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 md:mt-2 text-sm md:text-base">
            Bun venit, {user.firstName} {user.lastName}! Gestionează sistemul
            din acest panou centralizat.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="default" className="text-xs">
              Administrator
            </Badge>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800 text-xs"
            >
              Vizualizare Admin
            </Badge>
          </div>
        </div>

        {/* Dashboard Switch */}
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
            <User className="h-4 w-4" />
            <span className="font-medium text-sm">Proprietar</span>
            <ArrowRightLeft className="h-3 w-3 opacity-60" />
          </Button>
        </div>
      </div>
    </div>
  );
}
