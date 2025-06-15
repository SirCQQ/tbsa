import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  DropletIcon,
  Users,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
} from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Building2,
      title: "Gestionare Multi-Clădiri",
      description:
        "Administrează eficient mai multe clădiri dintr-un singur dashboard centralizat.",
      highlights: [
        "Dashboard centralizat",
        "Configurări flexibile",
        "Raportare unificată",
      ],
      color: "bg-blue-500",
    },
    {
      icon: DropletIcon,
      title: "Citiri Apă Automatizate",
      description:
        "Colectează, validează și gestionează citirile de apă cu deadline-uri configurabile.",
      highlights: [
        "Validare automată",
        "Deadline flexibile",
        "Istoric complet",
      ],
      color: "bg-cyan-500",
    },
    {
      icon: Users,
      title: "Colaborare Simplificată",
      description:
        "Facilitează comunicarea între administratori și proprietari pentru transparență maximă.",
      highlights: [
        "Notificări instant",
        "Portal proprietari",
        "Comunicare directă",
      ],
      color: "bg-purple-500",
    },
    {
      icon: TrendingUp,
      title: "Raportare Avansată",
      description:
        "Generează rapoarte detaliate și analize pentru consum și tendințe.",
      highlights: ["Statistici avansate", "Export data", "Trend analysis"],
      color: "bg-green-500",
    },
    {
      icon: Shield,
      title: "Securitate Robustă",
      description:
        "Protecție completă a datelor cu autentificare securizată și roluri definite.",
      highlights: [
        "JWT Authentication",
        "Role-based access",
        "Data encryption",
      ],
      color: "bg-red-500",
    },
    {
      icon: Clock,
      title: "Automatizare Inteligentă",
      description:
        "Procese automatizate pentru reducerea timpului de administrare.",
      highlights: ["Reminder automate", "Calcule automater", "Workflow simplu"],
      color: "bg-orange-500",
    },
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Funcționalități
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Funcționalități complete pentru gestionarea asociației
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            TBSA oferă toate instrumentele necesare pentru gestionarea eficientă
            a asociațiilor de apartamente, de la citiri până la raportare.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card
                key={index}
                className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.color} mb-4`}
                  >
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight, idx) => (
                      <li
                        key={idx}
                        className="flex items-center text-sm text-muted-foreground"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-card rounded-2xl p-8 shadow-xs">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                100%
              </div>
              <div className="text-sm text-muted-foreground">
                Automatizare citiri
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                24/7
              </div>
              <div className="text-sm text-muted-foreground">
                Disponibilitate sistem
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                99.9%
              </div>
              <div className="text-sm text-muted-foreground">
                Acuratețe date
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
