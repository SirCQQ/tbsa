"use client";

import {
  DashboardHeader,
  StatsGrid,
  RecentActivity,
  QuickActions,
  ConsumptionChart,
  SidebarQuickActions,
} from "@/components/dashboard";
import type { SafeUser } from "@/types/auth";

interface OwnerDashboardProps {
  user: SafeUser;
}

export function OwnerDashboard({ user }: OwnerDashboardProps) {
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <DashboardHeader user={user} />
        <StatsGrid user={user} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Main Actions */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <RecentActivity user={user} />
            <QuickActions user={user} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4 md:space-y-6">
            <ConsumptionChart user={user} />
            <SidebarQuickActions user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
