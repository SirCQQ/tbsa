import { StatCard } from "./stat-card";
import { Home, Droplets, TrendingUp, Calculator } from "lucide-react";

export function OwnerStatsGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Apartamentele Mele"
        value="2"
        description="Apartamente înregistrate"
        icon={Home}
        trend="neutral"
        color="blue"
      />
      <StatCard
        title="Citiri Lunare"
        value="2"
        description="Toate completate"
        icon={Droplets}
        trend="up"
        color="green"
      />
      <StatCard
        title="Consum Total"
        value="89.5 m³"
        description="+3.2% față de luna trecută"
        icon={TrendingUp}
        trend="up"
        color="purple"
      />
      <StatCard
        title="Cost Estimat"
        value="156.30 RON"
        description="Pentru luna curentă"
        icon={Calculator}
        trend="neutral"
        color="orange"
      />
    </div>
  );
}
