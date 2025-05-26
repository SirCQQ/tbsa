"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  StatsGrid,
  RecentActivity,
  ConsumptionChart,
  SidebarQuickActions,
  AdminHeader,
  PendingValidations,
  SystemOverview,
  AdminQuickStats,
  UserManagement,
} from "@/components/dashboard";

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isLoading && isAuthenticated && user) {
      // Only allow administrators
      if (user.role !== "ADMINISTRATOR") {
        router.push("/dashboard");
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Only render for ADMINISTRATOR role
  if (user.role !== "ADMINISTRATOR") {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <AdminHeader user={user} />
        <StatsGrid user={user} />

        {/* Admin Content Grid - Different layout for admins */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6">
          {/* Left Column - Main Admin Actions (wider) */}
          <div className="xl:col-span-3 space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <RecentActivity user={user} />
              <UserManagement />
            </div>

            {/* Admin-specific sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <PendingValidations />
              <SystemOverview />
            </div>
          </div>

          {/* Right Column - Admin Sidebar */}
          <div className="space-y-4 md:space-y-6">
            <ConsumptionChart user={user} />
            <SidebarQuickActions user={user} />
            <AdminQuickStats />
          </div>
        </div>
      </div>
    </div>
  );
}
