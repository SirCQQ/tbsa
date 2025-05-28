"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { Clock, Droplets, User, Building2, CheckCircle } from "lucide-react";

type Activity = {
  id: string;
  type: "reading" | "user" | "building" | "validation";
  title: string;
  description: string;
  timestamp: string;
  status: "success" | "pending" | "warning";
  user?: string;
};

export function RecentActivity() {
  const { user, hasPermission } = useAuth();

  if (!user) return null;

  // Use permissions instead of role checks
  const isAdmin = hasPermission("buildings:read:all");
  const canViewAllActivity = hasPermission("buildings:read:all");
  const canViewOwnActivity = hasPermission("apartments:read:own");

  if (!canViewAllActivity && !canViewOwnActivity) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Nu aveți permisiuni pentru a vizualiza activitatea.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Mock data - în realitate ar veni din API
  const adminActivities: Activity[] = [
    {
      id: "1",
      type: "reading",
      title: "Citire nouă trimisă",
      description: "Apartament 12, Etaj 3 - 45.2 m³",
      timestamp: "Acum 5 minute",
      status: "pending",
      user: "Maria Popescu",
    },
    {
      id: "2",
      type: "user",
      title: "Utilizator nou înregistrat",
      description: "Ion Georgescu s-a înregistrat",
      timestamp: "Acum 15 minute",
      status: "success",
    },
    {
      id: "3",
      type: "validation",
      title: "Citiri validate",
      description: "5 citiri aprobate pentru Clădirea A",
      timestamp: "Acum 1 oră",
      status: "success",
      user: "Admin",
    },
    {
      id: "4",
      type: "building",
      title: "Clădire actualizată",
      description: "Deadline citiri schimbat la 25",
      timestamp: "Acum 2 ore",
      status: "success",
    },
  ];

  const ownerActivities: Activity[] = [
    {
      id: "1",
      type: "reading",
      title: "Citire trimisă cu succes",
      description: "Apartament 5A - 23.4 m³",
      timestamp: "Acum 2 ore",
      status: "success",
    },
    {
      id: "2",
      type: "reading",
      title: "Reminder citire",
      description: "Termen limită în 3 zile",
      timestamp: "Ieri",
      status: "warning",
    },
    {
      id: "3",
      type: "validation",
      title: "Citire validată",
      description: "Citirea din decembrie a fost aprobată",
      timestamp: "Acum 2 zile",
      status: "success",
    },
  ];

  const activities = isAdmin ? adminActivities : ownerActivities;

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "reading":
        return <Droplets className="h-4 w-4" />;
      case "user":
        return <User className="h-4 w-4" />;
      case "building":
        return <Building2 className="h-4 w-4" />;
      case "validation":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: Activity["status"]) => {
    switch (status) {
      case "success":
        return <Badge variant="secondary">Completat</Badge>;
      case "pending":
        return <Badge variant="outline">În așteptare</Badge>;
      case "warning":
        return <Badge variant="destructive">Atenție</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg border-0 shadow-sm bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
          {isAdmin ? "Activitate Recentă" : "Activitatea Mea"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Ultimele acțiuni din sistem
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50"
            >
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium">{activity.title}</h4>
                  {getStatusBadge(activity.status)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {activity.timestamp}
                  </span>
                  {activity.user && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {activity.user}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
