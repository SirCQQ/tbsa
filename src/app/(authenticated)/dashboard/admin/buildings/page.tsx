"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BuildingsManagement } from "@/components/dashboard/admin/buildings-management";
import { AdminHeader } from "@/components/dashboard";

export default function BuildingsPage() {
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
        <BuildingsManagement />
      </div>
    </div>
  );
}
