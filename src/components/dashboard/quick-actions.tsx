"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Settings,
  Upload,
  MessageSquare,
  Zap,
  CheckCircle,
  BarChart3,
  AlertTriangle,
  Building2,
  Home,
} from "lucide-react";
import type { SafeUser } from "@/types/auth";
import { SubmitReadingModal } from "./modals/submit-reading-modal";
import { ValidateReadingsModal } from "./modals/validate-readings-modal";

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
  const [isSubmitReadingOpen, setIsSubmitReadingOpen] = useState(false);
  const [isValidateReadingsOpen, setIsValidateReadingsOpen] = useState(false);
  const router = useRouter();

  const isAdmin = user.role === "ADMINISTRATOR";

  const getActionColor = (index: number) => {
    const colors = [
      "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
      "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
      "bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700",
      "bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700",
    ];
    return colors[index % colors.length];
  };

  const adminActions: ActionButton[] = [
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Validează Citiri",
      description: "Aprobă citirile utilizatorilor",
      onClick: () => setIsValidateReadingsOpen(true),
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      title: "Gestionează Clădiri",
      description: "Administrează clădirile tale",
      onClick: () => router.push("/dashboard/admin/buildings"),
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Gestionează Utilizatori",
      description: "Administrează conturile",
      onClick: () => console.log("Gestionează Utilizatori"),
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Rapoarte Generale",
      description: "Statistici și analize",
      onClick: () => console.log("Rapoarte Generale"),
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      title: "Alerte Sistem",
      description: "Monitorizează probleme",
      onClick: () => console.log("Alerte Sistem"),
    },
  ];

  const ownerActions: ActionButton[] = [
    {
      icon: <Home className="h-5 w-5" />,
      title: "Apartamentele Mele",
      description: "Gestionează apartamentele tale",
      onClick: () => router.push("/dashboard/apartments"),
    },
    {
      icon: <Upload className="h-5 w-5" />,
      title: "Trimite Citire",
      description: "Adaugă citirea lunară de apă",
      onClick: () => setIsSubmitReadingOpen(true),
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Raport Consum",
      description: "Vizualizează consumul lunar",
      onClick: () => console.log("Raport Consum"),
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Contact Support",
      description: "Trimite mesaj administratorului",
      onClick: () => console.log("Contact Support"),
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: "Setări Contor",
      description: "Configurează preferințele",
      onClick: () => console.log("Setări Contor"),
    },
  ];

  const actions = isAdmin ? adminActions : ownerActions;

  return (
    <>
      <Card className="transition-all duration-300 hover:shadow-lg border-0 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Zap className="h-5 w-5 text-blue-600" />
            Acțiuni Rapide
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Funcționalități frecvent utilizate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`
                  ${getActionColor(index)}
                  text-white border-0 shadow-md
                  h-20 sm:h-24 lg:h-28 xl:h-[85px]
                  flex flex-col items-center justify-center gap-1 sm:gap-2
                  transition-all duration-200 hover:scale-105 hover:shadow-lg
                  group relative overflow-hidden
                `}
                onClick={action.onClick}
              >
                <div className="transition-transform duration-200 group-hover:scale-110">
                  {action.icon}
                </div>
                <div className="text-center">
                  <div className="text-xs sm:text-sm font-medium leading-tight whitespace-normal">
                    {action.title}
                  </div>
                  <div className="text-[10px] sm:text-xs opacity-90 leading-tight whitespace-normal">
                    {action.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <SubmitReadingModal
        open={isSubmitReadingOpen}
        onOpenChange={setIsSubmitReadingOpen}
      />

      <ValidateReadingsModal
        open={isValidateReadingsOpen}
        onOpenChange={setIsValidateReadingsOpen}
      />
    </>
  );
}
