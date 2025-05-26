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

  const getTrendColor = () => {
    if (trend > 0.5) return "text-red-500";
    if (trend < -0.5) return "text-green-500";
    return "text-gray-500";
  };

  const maxConsumption = Math.max(
    ...mockData.map((d) => Math.max(d.consumption, d.average))
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          {isAdmin ? "Consum Mediu Clădire" : "Consumul Meu"}
        </CardTitle>
        <CardDescription className="text-xs">
          Ultimele 6 luni (m³)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mini Chart */}
        <div className="flex items-end justify-between h-16 gap-1">
          {mockData.map((data, index) => {
            const height = (data.consumption / maxConsumption) * 100;
            const avgHeight = (data.average / maxConsumption) * 100;
            const isCurrentMonth = index === mockData.length - 1;

            return (
              <div
                key={data.month}
                className="flex flex-col items-center flex-1"
              >
                <div className="relative w-full flex items-end justify-center h-12">
                  {/* Average line */}
                  <div
                    className="absolute w-full border-t border-dashed border-gray-300 opacity-50"
                    style={{ bottom: `${avgHeight * 0.75}%` }}
                  />
                  {/* Consumption bar */}
                  <div
                    className={`w-3 rounded-t transition-all duration-300 ${
                      isCurrentMonth
                        ? "bg-blue-500"
                        : data.consumption > data.average
                        ? "bg-red-400"
                        : "bg-green-400"
                    }`}
                    style={{ height: `${height * 0.75}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {data.month}
                </span>
              </div>
            );
          })}
        </div>

        {/* Current Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {currentMonth.month}: {currentMonth.consumption} m³
            </span>
            <div
              className={`flex items-center gap-1 text-xs ${getTrendColor()}`}
            >
              {getTrendIcon()}
              {Math.abs(trend).toFixed(1)}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Media clădirii: {currentMonth.average} m³</span>
            <Badge
              variant={isAboveAverage ? "destructive" : "secondary"}
              className="text-xs"
            >
              {isAboveAverage ? "Peste medie" : "Sub medie"}
            </Badge>
          </div>
        </div>

        {/* Quick Insight */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
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
