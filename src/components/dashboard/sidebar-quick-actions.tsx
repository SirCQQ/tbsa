"use client";

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
  Home,
  Ticket,
  Building2,
} from "lucide-react";
import type { SafeUser } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

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

export function SidebarQuickActions() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();

  if (!user) return null;

  // Use permissions instead of role checks
  const isAdmin = hasPermission("buildings:read:all");
  const canCreateBuildings = hasPermission("buildings:create:all");
  const canManageUsers = hasPermission("users:read:all");
  const canCreateApartments = hasPermission("apartments:create:own");
  const canSubmitReadings = hasPermission("water_readings:create:own");

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
      icon: <Ticket className="h-4 w-4" />,
      label: "Coduri Invitație",
      description: "Gestionează codurile",
      variant: "outline",
      onClick: () => router.push("/dashboard/admin/invite-codes"),
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
      icon: <Home className="h-4 w-4" />,
      label: "Apartamentele Mele",
      description: "Gestionează apartamentele",
      variant: "outline",
      onClick: () => router.push("/dashboard/apartments"),
    },
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
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-foreground">
          <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
          Acțiuni Rapide
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {isAdmin ? "Administrare sistem" : "Gestionare apartament"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Admin Actions */}
        {canCreateBuildings && (
          <Button asChild className="w-full justify-start" variant="outline">
            <Link href="/dashboard/admin/buildings/create">
              <Building2 className="mr-2 h-4 w-4" />
              Adaugă Clădire
            </Link>
          </Button>
        )}

        {canManageUsers && (
          <Button asChild className="w-full justify-start" variant="outline">
            <Link href="/dashboard/admin/users">
              <Users className="mr-2 h-4 w-4" />
              Gestionează Utilizatori
            </Link>
          </Button>
        )}

        {isAdmin && (
          <Button asChild className="w-full justify-start" variant="outline">
            <Link href="/dashboard/admin/reports">
              <FileText className="mr-2 h-4 w-4" />
              Rapoarte
            </Link>
          </Button>
        )}

        {/* Owner Actions */}
        {canCreateApartments && (
          <Button asChild className="w-full justify-start" variant="outline">
            <Link href="/dashboard/apartments/create">
              <Home className="mr-2 h-4 w-4" />
              Adaugă Apartament
            </Link>
          </Button>
        )}

        {canSubmitReadings && (
          <Button asChild className="w-full justify-start" variant="outline">
            <Link href="/dashboard/readings/submit">
              <Droplets className="mr-2 h-4 w-4" />
              Trimite Citire
            </Link>
          </Button>
        )}

        {/* Common Actions */}
        <Button asChild className="w-full justify-start" variant="outline">
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Setări
          </Link>
        </Button>

        {actions.map((action, index) => (
          <div key={index} className="relative">
            {action.urgent && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
            <Button
              variant={action.variant || "ghost"}
              className="w-full h-auto p-4 flex items-center gap-3 text-left bg-muted hover:bg-accent transition-all duration-200 min-h-[60px]"
              onClick={action.onClick}
            >
              <div className="flex-shrink-0 mt-0.5 text-primary">
                {action.icon}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground break-words leading-tight flex-1">
                    {action.label}
                  </span>
                  {action.badge && (
                    <Badge
                      variant={action.badge.variant}
                      className="text-xs px-1.5 py-0.5 flex-shrink-0"
                    >
                      {action.badge.text}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground break-words leading-relaxed">
                  {action.description}
                </p>
              </div>
            </Button>
          </div>
        ))}

        {/* Context-aware notification */}
        {mockContext.hasUnreadNotifications && (
          <div className="mt-4 p-2 bg-muted border rounded-md">
            <div className="flex items-center gap-2">
              <Bell className="h-3 w-3 text-primary" />
              <span className="text-xs text-foreground">Ai notificări noi</span>
            </div>
          </div>
        )}

        {/* Urgent deadline warning for owners */}
        {!isAdmin && mockContext.daysUntilDeadline <= 3 && (
          <div className="mt-4 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-destructive" />
              <span className="text-xs text-destructive">
                Deadline citiri în {mockContext.daysUntilDeadline} zile!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
