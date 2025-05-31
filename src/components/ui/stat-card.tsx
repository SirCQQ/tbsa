import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCardColor } from "@/lib/constants/colors";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconColor?: StatCardColor | string; // Predefined colors + any Tailwind class
  trend?: {
    value: string | number;
    label: string;
    type?: "positive" | "negative" | "neutral";
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-muted-foreground",
  trend,
  className,
}: StatCardProps) {
  const getTrendColor = (type?: "positive" | "negative" | "neutral") => {
    switch (type) {
      case "positive":
        return "text-green-600 dark:text-green-400";
      case "negative":
        return "text-red-600 dark:text-red-400";
      case "neutral":
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={cn("relative", className)}>
      <CardHeader className="pb-1 px-3 pt-3 lg:px-6 lg:pt-6 lg:pb-2">
        <CardTitle className="text-sm lg:text-base font-medium pr-8">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 lg:px-6 lg:pb-6">
        <div className="text-xl lg:text-3xl font-bold">{value}</div>
        {description && (
          <p className="text-xs lg:text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <p
            className={cn("text-xs lg:text-sm mt-1", getTrendColor(trend.type))}
          >
            {typeof trend.value === "number" && trend.value > 0 && "+"}
            {trend.value} {trend.label}
          </p>
        )}
      </CardContent>
      {Icon && (
        <div className="absolute top-1/2 right-2 lg:right-4 transform -translate-y-1/2">
          <Icon className={cn("h-6 w-6 lg:h-8 lg:w-8", iconColor)} />
        </div>
      )}
    </Card>
  );
}
