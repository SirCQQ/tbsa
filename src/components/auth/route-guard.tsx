"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type RouteGuardProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
};

export function RouteGuard({
  children,
  requireAuth = true,
  redirectTo = "/auth/login",
  fallback,
}: RouteGuardProps) {
  return <>{children}</>;
  //   const { data: session, status } = useSession();
  //   const router = useRouter();

  //   useEffect(() => {
  //     if (status === "loading") return; // Still loading

  //     if (requireAuth && status === "unauthenticated") {
  //       console.log("🚫 RouteGuard: Redirecting to login");
  //       router.push(redirectTo);
  //       return;
  //     }

  //     if (!requireAuth && status === "authenticated") {
  //       console.log("🔄 RouteGuard: Redirecting authenticated user to dashboard");
  //       router.push("/dashboard");
  //       return;
  //     }
  //   }, [status, requireAuth, redirectTo, router]);

  //   // Show loading state
  //   if (status === "loading") {
  //     return (
  //       fallback || (
  //         <div className="min-h-screen flex items-center justify-center">
  //           <LoadingSpinner />
  //         </div>
  //       )
  //     );
  //   }

  //   // Show children if authorized
  //   if (requireAuth && status === "authenticated") {
  //     return <>{children}</>;
  //   }

  //   if (!requireAuth && status === "unauthenticated") {
  //     return <>{children}</>;
  //   }

  //   // Default fallback
  //   return (
  //     fallback || (
  //       <div className="min-h-screen flex items-center justify-center">
  //         <LoadingSpinner />
  //       </div>
  //     )
  //   );
}
