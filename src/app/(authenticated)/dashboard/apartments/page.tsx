"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserApartmentsPage } from "@/components/dashboard/user/apartments";

export default function ApartmentsPage() {
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

  // Allow both OWNER and ADMINISTRATOR roles to access this page
  if (user.role !== "OWNER" && user.role !== "ADMINISTRATOR") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Acces Restricționat
          </h2>
          <p className="text-muted-foreground">
            Doar proprietarii și administratorii pot accesa această pagină.
          </p>
        </div>
      </div>
    );
  }

  return <UserApartmentsPage user={user} />;
}
