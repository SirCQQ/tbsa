"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    return null; // Will redirect via useEffect
  }

  return (
    <PermissionGuard
      permission="buildings:read:all"
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Acces Restricționat</AlertTitle>
                <AlertDescription>
                  Nu aveți permisiunile necesare pentru a accesa zona de
                  administrare.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      }
      showLoading={true}
    >
      {children}
    </PermissionGuard>
  );
}
