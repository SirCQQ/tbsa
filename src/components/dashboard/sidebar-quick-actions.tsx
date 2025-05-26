import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Droplets,
  Plus,
  AlertTriangle,
  FileText,
  Users,
  Clock,
  Settings,
  Bell,
  TrendingUp,
} from "lucide-react";
import type { SafeUser } from "@/types/auth";

type QuickAction = {
  icon: React.ReactNode;
  label: string;
  description: string;
  variant?: "default" | "outline" | "secondary" | "destructive";
  badge?: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
  onClick?: () => void;
  urgent?: boolean;
};

type SidebarQuickActionsProps = {
  user: SafeUser;
};

export function SidebarQuickActions({ user }: SidebarQuickActionsProps) {
  const isAdmin = user.role === "ADMINISTRATOR";

  // Mock data pentru context
  const mockContext = {
    pendingReadings: 3,
    overdueReadings: 1,
    newUsers: 2,
    daysUntilDeadline: 5,
    hasUnreadNotifications: true,
  };

  const getAdminActions = (): QuickAction[] => [
    {
      icon: <AlertTriangle className="h-4 w-4" />,
      label: "Validează Citiri",
      description: "Citiri în așteptare",
      variant: "destructive",
      badge: {
        text: mockContext.pendingReadings.toString(),
        variant: "destructive",
      },
      urgent: mockContext.overdueReadings > 0,
      onClick: () => console.log("Navigate to pending readings"),
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: "Utilizatori Noi",
      description: "Aprobare necesară",
      variant: "outline",
      badge: {
        text: mockContext.newUsers.toString(),
        variant: "secondary",
      },
      onClick: () => console.log("Navigate to user management"),
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: "Generează Raport",
      description: "Raport lunar",
      variant: "outline",
      onClick: () => console.log("Generate monthly report"),
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      label: "Analiză Consum",
      description: "Statistici avansate",
      variant: "outline",
      onClick: () => console.log("Navigate to analytics"),
    },
  ];

  const getOwnerActions = (): QuickAction[] => [
    {
      icon: <Droplets className="h-4 w-4" />,
      label: "Trimite Citire",
      description: `${mockContext.daysUntilDeadline} zile rămase`,
      variant: mockContext.daysUntilDeadline <= 3 ? "destructive" : "default",
      urgent: mockContext.daysUntilDeadline <= 3,
      onClick: () => console.log("Navigate to submit reading"),
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: "Istoric Citiri",
      description: "Vezi citirile anterioare",
      variant: "outline",
      onClick: () => console.log("Navigate to reading history"),
    },
    {
      icon: <Bell className="h-4 w-4" />,
      label: "Setează Reminder",
      description: "Notificări citiri",
      variant: "outline",
      onClick: () => console.log("Set up reminders"),
    },
    {
      icon: <Settings className="h-4 w-4" />,
      label: "Setări Cont",
      description: "Actualizează profilul",
      variant: "outline",
      onClick: () => console.log("Navigate to settings"),
    },
  ];

  const actions = isAdmin ? getAdminActions() : getOwnerActions();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Plus className="h-4 w-4 text-green-500" />
          Acțiuni Rapide
        </CardTitle>
        <CardDescription className="text-xs">
          {isAdmin ? "Administrare sistem" : "Gestionare apartament"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <div key={index} className="relative">
            {action.urgent && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
            <Button
              variant={action.variant || "outline"}
              className="w-full h-auto p-3 flex items-start gap-3 text-left"
              onClick={action.onClick}
            >
              <div className="flex-shrink-0 mt-0.5">{action.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">
                    {action.label}
                  </span>
                  {action.badge && (
                    <Badge
                      variant={action.badge.variant}
                      className="text-xs px-1.5 py-0.5"
                    >
                      {action.badge.text}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {action.description}
                </p>
              </div>
            </Button>
          </div>
        ))}

        {/* Context-aware notification */}
        {mockContext.hasUnreadNotifications && (
          <div className="mt-4 p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex items-center gap-2">
              <Bell className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-blue-700 dark:text-blue-300">
                Ai notificări noi
              </span>
            </div>
          </div>
        )}

        {/* Urgent deadline warning for owners */}
        {!isAdmin && mockContext.daysUntilDeadline <= 3 && (
          <div className="mt-4 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-red-500" />
              <span className="text-xs text-red-700 dark:text-red-300">
                Deadline citiri în {mockContext.daysUntilDeadline} zile!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
