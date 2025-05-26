import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Droplets,
  FileText,
  Settings,
  Calendar,
} from "lucide-react";
import type { SafeUser } from "@/types/auth";

type ActionButton = {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
};

type QuickActionsProps = {
  user: SafeUser;
};

export function QuickActions({ user }: QuickActionsProps) {
  const isAdmin = user.role === "ADMINISTRATOR";

  const adminActions: ActionButton[] = [
    {
      icon: <Building2 className="h-5 w-5" />,
      title: "Gestionează Clădiri",
      description: "Adaugă sau editează clădiri",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Gestionează Proprietari",
      description: "Administrează conturile utilizatorilor",
    },
    {
      icon: <Droplets className="h-5 w-5" />,
      title: "Validează Citiri",
      description: "Verifică citirile în așteptare",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Generează Rapoarte",
      description: "Creează rapoarte lunare",
    },
  ];

  const ownerActions: ActionButton[] = [
    {
      icon: <Droplets className="h-5 w-5" />,
      title: "Trimite Citire",
      description: "Adaugă citirea lunară de apă",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Istoric Citiri",
      description: "Vezi citirile anterioare",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "Programează Reminder",
      description: "Setează notificări pentru citiri",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: "Setări Cont",
      description: "Actualizează informațiile personale",
    },
  ];

  const actions = isAdmin ? adminActions : ownerActions;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acțiuni Rapide</CardTitle>
        <CardDescription>Funcționalități frecvent utilizate</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              className="h-auto p-4 flex flex-col items-start gap-2"
              variant="outline"
              onClick={action.onClick}
            >
              {action.icon}
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs text-muted-foreground">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
