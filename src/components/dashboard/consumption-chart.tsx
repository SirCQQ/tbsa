import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Droplets } from "lucide-react";
import type { SafeUser } from "@/types/auth";

type ConsumptionData = {
  month: string;
  consumption: number;
  average: number;
};

type ConsumptionChartProps = {
  user: SafeUser;
};

export function ConsumptionChart({ user }: ConsumptionChartProps) {
  const isAdmin = user.role === "ADMINISTRATOR";

  // Mock data - în realitate ar veni din API
  const mockData: ConsumptionData[] = [
    { month: "Aug", consumption: 15.2, average: 16.8 },
    { month: "Sep", consumption: 14.8, average: 16.8 },
    { month: "Oct", consumption: 16.5, average: 16.8 },
    { month: "Nov", consumption: 18.2, average: 16.8 },
    { month: "Dec", consumption: 17.1, average: 16.8 },
    { month: "Ian", consumption: 19.3, average: 16.8 },
  ];

  const currentMonth = mockData[mockData.length - 1];
  const previousMonth = mockData[mockData.length - 2];
  const trend = currentMonth.consumption - previousMonth.consumption;
  const isAboveAverage = currentMonth.consumption > currentMonth.average;

  const getTrendIcon = () => {
    if (trend > 0.5) return <TrendingUp className="h-3 w-3" />;
    if (trend < -0.5) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0.5) return "text-destructive";
    if (trend < -0.5) return "text-green-600 dark:text-green-400";
    return "text-muted-foreground";
  };

  const maxConsumption = Math.max(
    ...mockData.map((d) => Math.max(d.consumption, d.average))
  );

  return (
    <Card className="transition-all duration-300 hover:shadow-lg border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 dark:shadow-gray-900/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-foreground">
          <Droplets className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          {isAdmin ? "Consum Mediu Clădire" : "Consumul Meu"}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Ultimele 6 luni (m³)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mini Chart */}
        <div className="flex items-end justify-between h-16 sm:h-20 gap-1 sm:gap-2 px-1">
          {mockData.map((data, index) => {
            const height = (data.consumption / maxConsumption) * 100;
            const avgHeight = (data.average / maxConsumption) * 100;
            const isCurrentMonth = index === mockData.length - 1;
            const trend =
              index > 0
                ? data.consumption - mockData[index - 1].consumption
                : 0;
            const trendPercentage =
              index > 0 ? (trend / mockData[index - 1].consumption) * 100 : 0;

            return (
              <div
                key={data.month}
                className="flex flex-col items-center flex-1 group cursor-pointer"
                title={`${data.month}: ${data.consumption} m³ (Media: ${data.average} m³)`}
              >
                <div className="relative w-full flex items-end justify-center h-12 sm:h-16">
                  {/* Average line */}
                  <div
                    className="absolute w-full border-t border-dashed border-gray-300 dark:border-gray-600 opacity-50 group-hover:opacity-80 transition-opacity duration-200"
                    style={{ bottom: `${avgHeight * 0.75}%` }}
                  />
                  {/* Consumption bar */}
                  <div
                    className={`w-3 sm:w-4 rounded-t transition-all duration-300 group-hover:scale-110 group-active:scale-95 ${
                      isCurrentMonth
                        ? "bg-primary hover:bg-primary/80"
                        : trend > 0
                        ? "bg-destructive hover:bg-destructive/80"
                        : "bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-500"
                    }`}
                    style={{ height: `${height * 0.75}%` }}
                  />

                  {/* Tooltip on hover/touch */}
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    {data.consumption} m³
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground mt-1 group-hover:text-foreground transition-colors duration-200">
                  {data.month}
                </span>
              </div>
            );
          })}
        </div>

        {/* Current Stats */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base font-medium text-foreground">
              {currentMonth.month}: {currentMonth.consumption} m³
            </span>
            <div className="flex items-center gap-1">
              <TrendingUp
                className={`h-3 w-3 sm:h-4 sm:w-4 ${getTrendColor(trend)}`}
              />
              <span className={`text-xs sm:text-sm ${getTrendColor(trend)}`}>
                {trend > 0 ? "+" : ""}
                {Math.abs(trend).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
            <span>Media clădirii: {currentMonth.average} m³</span>
            <Badge
              variant={isAboveAverage ? "destructive" : "secondary"}
              className="text-xs sm:text-sm"
            >
              {isAboveAverage ? "Peste medie" : "Sub medie"}
            </Badge>
          </div>
        </div>

        {/* Quick Insight */}
        <div className="text-xs sm:text-sm text-muted-foreground bg-muted p-3 sm:p-4 rounded-lg">
          {trend > 0
            ? `Consum crescut cu ${trend.toFixed(1)} m³ față de luna trecută`
            : trend < 0
            ? `Consum redus cu ${Math.abs(trend).toFixed(
                1
              )} m³ față de luna trecută`
            : "Consum stabil față de luna trecută"}
        </div>
      </CardContent>
    </Card>
  );
}
