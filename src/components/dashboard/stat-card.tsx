import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  color?: "blue" | "green" | "purple" | "orange" | "red";
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend = "neutral",
  color = "blue",
}: StatCardProps) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50",
    green:
      "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/50",
    purple:
      "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/50",
    orange:
      "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/50",
    red: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/50",
  };

  const trendClasses = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 dark:shadow-gray-900/20 min-h-[120px] sm:min-h-[130px] cursor-pointer active:scale-95">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/20 dark:to-gray-800/20 pointer-events-none" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 relative p-4 sm:p-6">
        <CardTitle className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 leading-tight">
          {title}
        </CardTitle>
        <div
          className={`p-2 sm:p-2.5 rounded-lg ${colorClasses[color]} transition-colors duration-200 flex-shrink-0`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </CardHeader>

      <CardContent className="relative p-4 sm:p-6 pt-0">
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
          {value}
        </div>
        <p
          className={`text-xs sm:text-sm font-medium ${trendClasses[trend]} leading-relaxed`}
        >
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
