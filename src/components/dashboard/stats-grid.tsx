import { Building2, Users, Droplets, Calendar } from "lucide-react";
import { StatCard } from "./stat-card";
import type { SafeUser } from "@/types/auth";

type StatsGridProps = {
  user: SafeUser;
};

export function StatsGrid({ user }: StatsGridProps) {
  const isAdmin = user.role === "ADMINISTRATOR";
  const isOwner = user.role === "OWNER";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 md:mb-8">
      {isAdmin && (
        <>
          <StatCard
            title="Total Clădiri"
            value={12}
            description="+2 față de luna trecută"
            icon={Building2}
            trend="up"
            color="blue"
          />
          <StatCard
            title="Proprietari Activi"
            value={248}
            description="+12% față de luna trecută"
            icon={Users}
            trend="up"
            color="green"
          />
        </>
      )}

      <StatCard
        title="Citiri Lunare"
        value={isOwner ? "3" : "1,247"}
        description={isOwner ? "Apartamente" : "Total citiri"}
        icon={Droplets}
        trend="neutral"
        color="purple"
      />

      <StatCard
        title="Deadline Citiri"
        value={25}
        description="Ianuarie 2024"
        icon={Calendar}
        trend="neutral"
        color="orange"
      />
    </div>
  );
}
