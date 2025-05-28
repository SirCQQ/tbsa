"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { OwnerDashboard } from "@/components/dashboard";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

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

  return (
    <PermissionGuard
      permission="apartments:read:own"
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Acces interzis
              </h2>
              <p className="text-gray-600">
                Nu aveți permisiunea să accesați această pagină.
              </p>
            </CardContent>
          </Card>
        </div>
      }
      showLoading={true}
    >
      <OwnerDashboard user={user} />
    </PermissionGuard>
  );
}
