import { Progress } from "@/components/ui/progress";

interface SystemMetric {
  label: string;
  value: string;
  progress: number;
  color: string;
}

const systemMetrics: SystemMetric[] = [
  {
    label: "Utilizatori Activi",
    value: "248/250",
    progress: 99.2,
    color: "text-green-600 dark:text-green-400",
  },
  {
    label: "Citiri Luna Curentă",
    value: "187/248",
    progress: 75.4,
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    label: "Apartamente Ocupate",
    value: "235/248",
    progress: 94.8,
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    label: "Rata Colectare",
    value: "75.4%",
    progress: 75.4,
    color: "text-orange-600 dark:text-orange-400",
  },
];

export function SystemOverview() {
  return (
    <div className="bg-card rounded-lg p-6 border-0 shadow-sm transition-all duration-300 hover:shadow-lg">
      <h3 className="text-lg font-semibold mb-6 text-foreground">
        Prezentare Generală Sistem
      </h3>
      <div className="space-y-6">
        {systemMetrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </span>
              <span className={`font-semibold ${metric.color}`}>
                {metric.value}
              </span>
            </div>
            <Progress value={metric.progress} className="h-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
