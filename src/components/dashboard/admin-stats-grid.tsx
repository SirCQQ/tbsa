import { StatCard } from "./stat-card";
import { Building2, Home, Droplets, TrendingUp } from "lucide-react";

export function AdminStatsGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Clădiri"
        value="12"
        description="+2 față de luna trecută"
        icon={Building2}
        trend="up"
        color="blue"
      />
      <StatCard
        title="Total Apartamente"
        value="248"
        description="+8 față de luna trecută"
        icon={Home}
        trend="up"
        color="green"
      />
      <StatCard
        title="Citiri Lunare"
        value="186"
        description="75% completate"
        icon={Droplets}
        trend="neutral"
        color="purple"
      />
      <StatCard
        title="Consum Mediu"
        value="45.2 m³"
        description="-2.1% față de luna trecută"
        icon={TrendingUp}
        trend="down"
        color="orange"
      />
    </div>
  );
}
