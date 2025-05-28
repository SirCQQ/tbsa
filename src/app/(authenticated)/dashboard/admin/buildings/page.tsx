"use client";

import { useAuth } from "@/contexts/auth-context";
import { BuildingsManagement } from "@/components/dashboard/admin/buildings-management";
import { AdminHeader } from "@/components/dashboard";

export default function BuildingsPage() {
  const { user } = useAuth();

  // At this point, authentication is guaranteed by the layout
  if (!user) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <AdminHeader user={user} />
        <BuildingsManagement />
      </div>
    </div>
  );
}
