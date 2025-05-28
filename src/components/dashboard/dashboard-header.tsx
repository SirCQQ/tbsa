"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Bell, Settings } from "lucide-react";
import { UserNav } from "@/components/auth/user-nav";

export function DashboardHeader() {
  const { user, hasPermission } = useAuth();

  if (!user) return null;

  // Check if user has admin permissions instead of role
  const isAdmin = hasPermission("buildings:read:own");

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <h1 className="text-lg font-semibold">
            {isAdmin ? "Panou Administrare" : "Panou Personal"}
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other content */}
          </div>
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  );
}
