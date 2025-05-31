"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data pentru ultimele 6 luni
const consumptionData = [
  {
    month: "Nov",
    consum: 45,
    consumAnterior: 42,
  },
  {
    month: "Dec",
    consum: 52,
    consumAnterior: 48,
  },
  {
    month: "Ian",
    consum: 48,
    consumAnterior: 45,
  },
  {
    month: "Feb",
    consum: 44,
    consumAnterior: 41,
  },
  {
    month: "Mar",
    consum: 51,
    consumAnterior: 49,
  },
  {
    month: "Apr",
    consum: 47,
    consumAnterior: 44,
  },
];

interface ConsumptionChartProps {
  className?: string;
}

export function ConsumptionChart({ className }: ConsumptionChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Consum Apă - Ultimele 6 Luni
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Comparație cu perioada anterioară (m³)
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={consumptionData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                className="text-xs fill-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                className="text-xs fill-muted-foreground"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}m³`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <p className="font-medium">{label}</p>
                        <div className="space-y-1">
                          {payload.map((entry, index) => (
                            <p
                              key={index}
                              className="text-sm"
                              style={{ color: entry.color }}
                            >
                              {entry.name}: {entry.value}m³
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="consum"
                name="Consum Actual"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{
                  fill: "hsl(var(--primary))",
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 2,
                }}
              />
              <Line
                type="monotone"
                dataKey="consumAnterior"
                name="Perioada Anterioară"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{
                  fill: "hsl(var(--muted-foreground))",
                  strokeWidth: 2,
                  r: 3,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
