"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { OwnerDashboard } from "@/components/dashboard";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
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

  // Allow both OWNER and ADMINISTRATOR roles to access this dashboard
  // Administrators can be property owners too
  if (user.role !== "OWNER" && user.role !== "ADMINISTRATOR") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acces interzis
          </h2>
          <p className="text-gray-600">
            Nu aveți permisiunea să accesați această pagină.
          </p>
        </div>
      </div>
    );
  }

  return <OwnerDashboard user={user} />;
}
