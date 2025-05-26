import { Badge } from "@/components/ui/badge";
import type { SafeUser } from "@/types/auth";

type DashboardHeaderProps = {
  user: SafeUser;
};

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const isAdmin = user.role === "ADMINISTRATOR";

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Dashboard
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-2">
        Bun venit, {user.firstName} {user.lastName}!
      </p>
      <Badge variant={isAdmin ? "default" : "secondary"} className="mt-2">
        {isAdmin ? "Administrator" : "Proprietar"}
      </Badge>
    </div>
  );
}
