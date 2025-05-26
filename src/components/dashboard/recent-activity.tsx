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
};

type RecentActivityProps = {
  user: SafeUser;
};

export function RecentActivity({ user }: RecentActivityProps) {
  const isAdmin = user.role === "ADMINISTRATOR";

  const adminActivities: ActivityItem[] = [
    {
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      title: "Citire validată pentru Bloc A, Apt. 15",
      time: "Acum 2 ore",
    },
    {
      icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
      title: "Citire în așteptare pentru Bloc B, Apt. 7",
      time: "Acum 4 ore",
    },
    {
      icon: <Users className="h-4 w-4 text-blue-500" />,
      title: "Proprietar nou înregistrat: Maria Popescu",
      time: "Ieri",
    },
  ];

  const ownerActivities: ActivityItem[] = [
    {
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      title: "Citire trimisă pentru Apt. 15A",
      time: "Acum 1 zi",
    },
    {
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      title: "Reminder: Citire în așteptare pentru Apt. 15B",
      time: "Deadline: 25 Ianuarie",
    },
    {
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      title: "Factură generată pentru luna Decembrie",
      time: "Acum 3 zile",
    },
  ];

  const activities = isAdmin ? adminActivities : ownerActivities;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Activitate Recentă
        </CardTitle>
        <CardDescription>Ultimele acțiuni din sistem</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-3">
              {activity.icon}
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
