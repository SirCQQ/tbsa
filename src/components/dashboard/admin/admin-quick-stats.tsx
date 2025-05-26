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
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-lg">
      <h4 className="font-semibold mb-3 text-sm text-gray-900 dark:text-white">
        Statistici Rapide
      </h4>
      <div className="space-y-2 text-xs">
        {quickStats.map((stat, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {stat.label}
            </span>
            <span
              className={`font-medium ${
                stat.color || "text-gray-900 dark:text-white"
              }`}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
