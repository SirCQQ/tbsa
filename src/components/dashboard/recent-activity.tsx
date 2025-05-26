import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Users,
  Clock,
  FileText,
} from "lucide-react";
import type { SafeUser } from "@/types/auth";

type ActivityItem = {
  icon: React.ReactNode;
  title: string;
  time: string;
  type: "success" | "warning" | "info";
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
    },
    {
      icon: <AlertCircle className="h-4 w-4" />,
      title: "Citire în așteptare pentru Bloc B, Apt. 7",
      time: "Acum 4 ore",
      type: "warning",
    },
    {
      icon: <Users className="h-4 w-4" />,
      title: "Proprietar nou înregistrat: Maria Popescu",
      time: "Ieri",
      type: "info",
    },
  ];

  const ownerActivities: ActivityItem[] = [
    {
      icon: <CheckCircle className="h-4 w-4" />,
      title: "Citire trimisă pentru Apt. 15A",
      time: "Acum 1 zi",
      type: "success",
    },
    {
      icon: <Clock className="h-4 w-4" />,
      title: "Reminder: Citire în așteptare pentru Apt. 15B",
      time: "Deadline: 25 Ianuarie",
      type: "warning",
    },
    {
      icon: <FileText className="h-4 w-4" />,
      title: "Factură generată pentru luna Decembrie",
      time: "Acum 3 zile",
      type: "info",
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
    <Card className="transition-all duration-300 hover:shadow-lg border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 dark:shadow-gray-900/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <div className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 rounded-lg">
            <TrendingUp className="h-4 w-4" />
          </div>
          Activitate Recentă
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Ultimele acțiuni din sistem
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {activities.map((activity, index) => {
            const styles = getActivityStyles(activity.type);
            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg border-l-2 ${styles.border} bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer active:scale-[0.98] min-h-[60px] sm:min-h-[70px]`}
              >
                <div
                  className={`p-2 sm:p-2.5 rounded-lg ${styles.iconBg} flex-shrink-0`}
                >
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white leading-tight break-words">
                    {activity.title}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
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
