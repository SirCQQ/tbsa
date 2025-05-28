import { useAuth } from "@/contexts/auth-context";
import { AdminStatsGrid } from "./admin-stats-grid";
import { OwnerStatsGrid } from "./owner-stats-grid";

export function StatsGrid() {
  const { user, hasPermission } = useAuth();

  if (!user) return null;

  // Use permissions instead of role checks
  const isAdmin = hasPermission("buildings:update:own");
  const isOwner = hasPermission("apartments:read:own");

  // Show admin stats if user has admin permissions
  if (isAdmin) {
    return <AdminStatsGrid />;
  }

  // Show owner stats if user has owner permissions but not admin
  if (isOwner) {
    return <OwnerStatsGrid />;
  }

  // Fallback for users without specific permissions
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">
        Nu aveți permisiuni pentru a vizualiza statisticile.
      </p>
    </div>
  );
}
