"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";
import { Page } from "@/components/ui/page";
import { Typography } from "@/components/ui/typography";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Crown, ArrowRight } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function DashboardPage() {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();

  if (isLoading) {
    return (
      <Page
        display="flex"
        justifyContent="center"
        alignItems="center"
        background="gradient-ocean"
        className="min-h-screen"
      >
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <Typography variant="p" className="text-muted-foreground">
            Se încarcă dashboard-ul...
          </Typography>
        </div>
      </Page>
    );
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  // If user has no organizations
  if (!user.organizations || user.organizations.length === 0) {
    return (
      <Page
        display="flex"
        justifyContent="center"
        alignItems="center"
        background="gradient-ocean"
        padding="lg"
        className="min-h-screen"
      >
        <Card className="backdrop-blur-md max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Nicio Organizație
            </CardTitle>
            <CardDescription>
              Nu faceți parte din nicio organizație momentan.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Typography variant="p" className="text-sm text-muted-foreground">
              Pentru a accesa dashboard-ul, trebuie să faceți parte dintr-o
              organizație. Contactați administratorul pentru a primi un cod de
              invitație.
            </Typography>
            <Button
              onClick={() => router.push("/auth/register")}
              borderRadius="full"
              className="w-full"
            >
              Înregistrați-vă cu cod de invitație
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

  // If user has multiple organizations, show selection
  return (
    <Page
      display="flex"
      justifyContent="start"
      alignItems="start"
      background="gradient-ocean"
      padding="lg"
      container="4xl"
      className="py-24"
    >
      <div className="w-full space-y-8">
        <div className="text-center space-y-4">
          <Typography variant="h1" gradient="blue">
            Selectați Organizația
          </Typography>
          <Typography
            variant="p"
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Alegeți organizația pentru care doriți să accesați panoul de
            administrare
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.organizations.map((org) => (
            <Card
              key={org.id}
              className="backdrop-blur-md hover:shadow-lg transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  {org.name}
                </CardTitle>
                <CardDescription>Cod: {org.code}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Organizație:</span>
                    <span className="font-medium">{org.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cod:</span>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {org.code}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => router.push(`/org/${org.code}/admin`)}
                  borderRadius="full"
                  className="w-full"
                >
                  Accesați Dashboard-ul
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Acțiuni Rapide
            </CardTitle>
            <CardDescription>
              Alte opțiuni disponibile pentru contul dumneavoastră
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                borderRadius="full"
                className="h-auto p-4 flex-col"
                onClick={() => router.push("/auth/register")}
              >
                <Building2 className="h-6 w-6 mb-2" />
                <span className="font-medium">
                  Alăturați-vă unei organizații
                </span>
                <span className="text-xs text-muted-foreground">
                  Cu cod de invitație
                </span>
              </Button>
              <Button
                variant="outline"
                borderRadius="full"
                className="h-auto p-4 flex-col"
                onClick={() => router.push("/profile")}
              >
                <Users className="h-6 w-6 mb-2" />
                <span className="font-medium">Gestionați Profilul</span>
                <span className="text-xs text-muted-foreground">
                  Setări cont
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
