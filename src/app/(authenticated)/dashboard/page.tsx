"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  DashboardHeader,
  StatsGrid,
  RecentActivity,
  QuickActions,
  ConsumptionChart,
  SidebarQuickActions,
} from "@/components/dashboard";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

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

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader user={user} />
        <StatsGrid user={user} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Actions */}
          <div className="lg:col-span-2 space-y-6">
            <RecentActivity user={user} />
            <QuickActions user={user} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <ConsumptionChart user={user} />
            <SidebarQuickActions user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
