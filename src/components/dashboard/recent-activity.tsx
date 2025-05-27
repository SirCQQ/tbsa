import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SafeUser } from "@/types/auth";
import { AlertCircle, CheckCircle, Clock, FileText, Users } from "lucide-react";

type ActivityItem = {
  icon: React.ReactNode;
  title: string;
  time: string;
  type: "success" | "warning" | "info";
  color: string;
};

type RecentActivityProps = {
  user: SafeUser;
};

export function RecentActivity({ user }: RecentActivityProps) {
  const isAdmin = user.role === "ADMINISTRATOR";

  const adminActivities: ActivityItem[] = [
    {
      icon: <CheckCircle className="h-4 w-4" />,
      title: "Citire validată pentru Bloc A, Apt. 15",
      time: "Acum 2 ore",
      type: "success",
      color:
        "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400",
    },
    {
      icon: <AlertCircle className="h-4 w-4" />,
      title: "Citire în așteptare pentru Bloc B, Apt. 7",
      time: "Acum 4 ore",
      type: "warning",
      color:
        "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400",
    },
    {
      icon: <Users className="h-4 w-4" />,
      title: "Proprietar nou înregistrat: Maria Popescu",
      time: "Ieri",
      type: "info",
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
    },
  ];

  const ownerActivities: ActivityItem[] = [
    {
      icon: <CheckCircle className="h-4 w-4" />,
      title: "Citire trimisă pentru Apt. 15A",
      time: "Acum 1 zi",
      type: "success",
      color:
        "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400",
    },
    {
      icon: <Clock className="h-4 w-4" />,
      title: "Reminder: Citire în așteptare pentru Apt. 15B",
      time: "Deadline: 25 Ianuarie",
      type: "warning",
      color:
        "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400",
    },
    {
      icon: <FileText className="h-4 w-4" />,
      title: "Factură generată pentru luna Decembrie",
      time: "Acum 3 zile",
      type: "info",
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
    },
  ];

  const activities = isAdmin ? adminActivities : ownerActivities;

  const getActivityStyles = (type: ActivityItem["type"]) => {
    switch (type) {
      case "success":
        return {
          iconBg:
            "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400",
          border: "border-l-green-200 dark:border-l-green-800",
        };
      case "warning":
        return {
          iconBg:
            "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400",
          border: "border-l-yellow-200 dark:border-l-yellow-800",
        };
      case "info":
        return {
          iconBg:
            "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
          border: "border-l-blue-200 dark:border-l-blue-800",
        };
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg border-0 shadow-sm bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
          Activitate Recentă
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Ultimele acțiuni din sistem
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted hover:bg-accent transition-colors duration-200"
              >
                <div
                  className={`p-2 rounded-lg ${activity.color} flex-shrink-0`}
                >
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-foreground leading-tight break-words">
                    {activity.title}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
