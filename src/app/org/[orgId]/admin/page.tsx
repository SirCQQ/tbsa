"use client";

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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Users,
  Building2,
  UserPlus,
  Settings,
  BarChart3,
  Crown,
  Calendar,
  MapPin,
} from "lucide-react";
import { AddBuildingModal } from "@/components/admin/add-building-modal";
import { GenerateInviteModal } from "@/components/admin/generate-invite-modal";
import { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { useParams } from "next/navigation";

export default function OrganizationAdminPage() {
  const params = useParams();
  const orgId = params.orgId as string;

  const [showAddBuilding, setShowAddBuilding] = useState(false);
  const [showGenerateInvite, setShowGenerateInvite] = useState(false);

  // Mock organization data - in real app, this would come from API
  const organization = {
    id: orgId,
    name: "Asociația Proprietarilor Bloc A1",
    code: "AP-A1-2024",
    address: "Strada Libertății Nr. 25, Sector 1, București",
    description:
      "Asociația proprietarilor pentru blocul A1 din complexul rezidențial Libertatea",
    subscriptionPlan: "Professional",
    createdAt: "2024-01-15",
    totalBuildings: 3,
    totalApartments: 156,
    totalUsers: 247,
    activeInvites: 8,
  };

  return (
    <Page
      display="flex"
      justifyContent="start"
      alignItems="start"
      background="gradient-ocean"
      padding="lg"
      container="7xl"
      className="py-24"
    >
      <div className="w-full space-y-8">
        {/* Header with Organization Info */}
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <Typography variant="h1" gradient="blue">
              Panou Administrator
            </Typography>
            <Typography
              variant="p"
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              Gestionați clădirile, utilizatorii și codurile de invitație pentru
              organizația dumneavoastră
            </Typography>
          </div>

          {/* Organization Details Card */}
          <Card className="backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Informații Organizație
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  {organization.subscriptionPlan}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    DENUMIRE
                  </h4>
                  <p className="font-semibold">{organization.name}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    COD ORGANIZAȚIE
                  </h4>
                  <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {organization.code}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    DATA ÎNFIINȚĂRII
                  </h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(organization.createdAt).toLocaleDateString(
                        "ro-RO"
                      )}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    ADRESĂ
                  </h4>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{organization.address}</span>
                  </div>
                </div>
                {organization.description && (
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <h4 className="font-medium text-sm text-muted-foreground">
                      DESCRIERE
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {organization.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Clădiri Totale"
            value={organization.totalBuildings.toString()}
            description="Clădiri administrate"
            icon={Building2}
            trend={{
              value: 1,
              label: "adăugată luna aceasta",
              type: "positive",
            }}
          />
          <StatCard
            title="Utilizatori Activi"
            value={organization.totalUsers.toString()}
            description="Utilizatori înregistrați"
            icon={Users}
            trend={{ value: 12, label: "noi utilizatori", type: "positive" }}
          />
          <StatCard
            title="Coduri Active"
            value={organization.activeInvites.toString()}
            description="Invitații în așteptare"
            icon={UserPlus}
            trend={{ value: 3, label: "expirate recent", type: "negative" }}
          />
          <StatCard
            title="Apartamente"
            value={organization.totalApartments.toString()}
            description="Unități locative"
            icon={BarChart3}
            trend={{ value: 5, label: "adăugate recent", type: "positive" }}
          />
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Building Management */}
          <Card className="backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Gestionare Clădiri
              </CardTitle>
              <CardDescription>
                Adăugați și gestionați clădirile din organizația{" "}
                {organization.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => setShowAddBuilding(true)}
                  borderRadius="full"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adaugă Clădire Nouă
                </Button>
                <Button
                  variant="outline"
                  borderRadius="full"
                  className="w-full"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Vezi Toate Clădirile ({organization.totalBuildings})
                </Button>
                <Button variant="ghost" borderRadius="full" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurări Clădiri
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invite Code Management */}
          <Card className="backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Coduri de Invitație
              </CardTitle>
              <CardDescription>
                Generați coduri de invitație pentru utilizatori noi în
                organizație
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => setShowGenerateInvite(true)}
                  borderRadius="full"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generează Cod Invitație
                </Button>
                <Button
                  variant="outline"
                  borderRadius="full"
                  className="w-full"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Vezi Coduri Active ({organization.activeInvites})
                </Button>
                <Button variant="ghost" borderRadius="full" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Rapoarte Invitații
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organization Management */}
        <Card className="backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Administrare Organizație
            </CardTitle>
            <CardDescription>
              Gestionați setările și configurările organizației
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="outline"
                borderRadius="full"
                className="h-auto p-4 flex-col"
              >
                <Users className="h-6 w-6 mb-2" />
                <span className="font-medium">Gestionare Utilizatori</span>
                <span className="text-xs text-muted-foreground">
                  {organization.totalUsers} utilizatori
                </span>
              </Button>
              <Button
                variant="outline"
                borderRadius="full"
                className="h-auto p-4 flex-col"
              >
                <Crown className="h-6 w-6 mb-2" />
                <span className="font-medium">Plan Abonament</span>
                <span className="text-xs text-muted-foreground">
                  {organization.subscriptionPlan}
                </span>
              </Button>
              <Button
                variant="outline"
                borderRadius="full"
                className="h-auto p-4 flex-col"
              >
                <BarChart3 className="h-6 w-6 mb-2" />
                <span className="font-medium">Rapoarte & Analize</span>
                <span className="text-xs text-muted-foreground">
                  Vezi statistici
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="backdrop-blur-md">
          <CardHeader>
            <CardTitle>Activitate Recentă</CardTitle>
            <CardDescription>
              Ultimele acțiuni efectuate în organizația {organization.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Clădire nouă adăugată</p>
                  <p className="text-xs text-muted-foreground">
                    Str. Libertății Nr. 27 - acum 2 ore
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Cod de invitație generat
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pentru maria.popescu@email.com - acum 4 ore
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Utilizator nou înregistrat
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ion Vasile - acum 6 ore
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Setări organizație actualizate
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Adresă modificată - acum 1 zi
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <AddBuildingModal
          open={showAddBuilding}
          onOpenChange={setShowAddBuilding}
          organizationId={orgId}
        />
        <GenerateInviteModal
          open={showGenerateInvite}
          onOpenChange={setShowGenerateInvite}
          organizationId={orgId}
        />
      </div>
    </Page>
  );
}
