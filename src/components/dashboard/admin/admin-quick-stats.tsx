interface QuickStat {
  label: string;
  value: string;
  color?: string;
}

const quickStats: QuickStat[] = [
  {
    label: "Citiri Azi",
    value: "12",
  },
  {
    label: "Utilizatori Noi",
    value: "3",
  },
  {
    label: "Probleme Raportate",
    value: "2",
    color: "text-red-600 dark:text-red-400",
  },
  {
    label: "Uptime Sistem",
    value: "99.9%",
    color: "text-green-600 dark:text-green-400",
  },
];

export function AdminQuickStats() {
  return (
    <div className="bg-card rounded-lg p-4 border shadow-sm transition-all duration-300 hover:shadow-lg">
      <h4 className="font-semibold mb-3 text-sm text-foreground">
        Statistici Rapide
      </h4>
      <div className="space-y-2 text-xs">
        {quickStats.map((stat, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-muted-foreground">{stat.label}</span>
            <span className={`font-medium ${stat.color || "text-foreground"}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
