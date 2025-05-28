"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Droplets } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ConsumptionData = {
  month: string;
  consumption: number;
  average: number;
};

export function ConsumptionChart() {
  const { user, hasPermission } = useAuth();

  if (!user) return null;

  // Use permissions instead of role checks
  const isAdmin = hasPermission("buildings:read:all");
  const canViewReadings =
    hasPermission("water_readings:read:own") ||
    hasPermission("water_readings:read:all");

  if (!canViewReadings) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Nu aveți permisiuni pentru a vizualiza graficul de consum.
          </p>
        </CardContent>
      </Card>
    );
  }

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
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`${value} m³`, "Consum"]}
              labelFormatter={(label: string) => `Luna: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="consumption"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ fill: "#8884d8" }}
            />
          </LineChart>
        </ResponsiveContainer>

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
