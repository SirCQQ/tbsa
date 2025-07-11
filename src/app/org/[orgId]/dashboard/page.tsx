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
import { OrgBuildingsList } from "@/components/admin/org-buildings-list";
import { PermissionGuardOr } from "@/components/auth/permission-guard";
import { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { useParams, useRouter } from "next/navigation";

import { ActionsEnum, ResourcesEnum } from "@prisma/client";
import { ICON_COLOR_MAPPINGS } from "@/lib/constants/icon-colors";

export default function OrganizationDashboardPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const router = useRouter();
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
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Header with Organization Info */}
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center space-y-2 sm:space-y-4">
            <Typography
              variant="h1"
              gradient="blue"
              className="text-2xl sm:text-3xl lg:text-4xl"
            >
              Dashboard Organizație
            </Typography>
            <Typography
              variant="p"
              className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-4 sm:px-0"
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
                  <Crown
                    className={`h-5 w-5 ${ICON_COLOR_MAPPINGS.adminDashboard.stats}`}
                  />
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
                    <Calendar
                      className={`h-4 w-4 ${ICON_COLOR_MAPPINGS.adminDashboard.stats}`}
                    />
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
                    <MapPin
                      className={`h-4 w-4 ${ICON_COLOR_MAPPINGS.adminDashboard.stats} mt-0.5`}
                    />
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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Clădiri Totale"
            value={organization.totalBuildings.toString()}
            description="Clădiri administrate"
            icon={Building2}
            iconColor={ICON_COLOR_MAPPINGS.adminDashboard.buildings}
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
            iconColor={ICON_COLOR_MAPPINGS.adminDashboard.users}
            trend={{ value: 12, label: "noi utilizatori", type: "positive" }}
          />
          <StatCard
            title="Coduri Active"
            value={organization.activeInvites.toString()}
            description="Invitații în așteptare"
            icon={UserPlus}
            iconColor={ICON_COLOR_MAPPINGS.adminDashboard.add}
            trend={{ value: 3, label: "expirate recent", type: "negative" }}
          />
          <StatCard
            title="Apartamente"
            value={organization.totalApartments.toString()}
            description="Unități locative"
            icon={BarChart3}
            iconColor={ICON_COLOR_MAPPINGS.adminDashboard.stats}
            trend={{ value: 5, label: "adăugate recent", type: "positive" }}
          />
        </div>
        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Building Management */}
          <Card className="backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Building2
                  className={`h-5 w-5 ${ICON_COLOR_MAPPINGS.adminDashboard.buildings}`}
                />
                Gestionare Clădiri
              </CardTitle>
              <CardDescription className="text-sm">
                Adăugați și gestionați clădirile din organizația{" "}
                {organization.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-3">
                <PermissionGuardOr
                  permissions={[
                    `${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`,
                  ]}
                >
                  <Button
                    onClick={() => setShowAddBuilding(true)}
                    borderRadius="full"
                    className="w-full"
                    variant="primary"
                  >
                    <Plus
                      className={`h-4 w-4 mr-2 ${ICON_COLOR_MAPPINGS.adminDashboard.add}`}
                    />
                    Adaugă Clădire Nouă
                  </Button>
                </PermissionGuardOr>

                <PermissionGuardOr
                  permissions={[
                    `${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`,
                  ]}
                >
                  <Button
                    variant="outline"
                    borderRadius="full"
                    className="w-full"
                    onClick={() => router.push(`/org/${orgId}/buildings`)}
                  >
                    <Building2
                      className={`h-4 w-4 mr-2 ${ICON_COLOR_MAPPINGS.adminDashboard.buildings}`}
                    />
                    Vezi Toate Clădirile ({organization.totalBuildings})
                  </Button>
                </PermissionGuardOr>

                <PermissionGuardOr
                  permissions={[
                    `${ResourcesEnum.BUILDINGS}:${ActionsEnum.UPDATE}`,
                    `${ResourcesEnum.BUILDINGS}:${ActionsEnum.DELETE}`,
                  ]}
                >
                  <Button
                    variant="ghost"
                    borderRadius="full"
                    className="w-full"
                  >
                    <Settings
                      className={`h-4 w-4 mr-2 ${ICON_COLOR_MAPPINGS.adminDashboard.manage}`}
                    />
                    Configurări Clădiri
                  </Button>
                </PermissionGuardOr>
              </div>
            </CardContent>
          </Card>

          {/* Invite Code Management */}
          <Card className="backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <UserPlus
                  className={`h-5 w-5 ${ICON_COLOR_MAPPINGS.adminDashboard.add}`}
                />
                Coduri de Invitație
              </CardTitle>
              <CardDescription className="text-sm">
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
                  variant="primary"
                >
                  <Plus
                    className={`h-4 w-4 mr-2 ${ICON_COLOR_MAPPINGS.adminDashboard.add}`}
                  />
                  Generează Cod Invitație
                </Button>
                <Button
                  variant="outline"
                  borderRadius="full"
                  className="w-full"
                >
                  <Users
                    className={`h-4 w-4 mr-2 ${ICON_COLOR_MAPPINGS.adminDashboard.users}`}
                  />
                  Vezi Coduri Active ({organization.activeInvites})
                </Button>
                <Button variant="ghost" borderRadius="full" className="w-full">
                  <BarChart3
                    className={`h-4 w-4 mr-2 ${ICON_COLOR_MAPPINGS.adminDashboard.stats}`}
                  />
                  Rapoarte Invitații
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Organization Management */}
        <Card className="backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Settings
                className={`h-5 w-5 ${ICON_COLOR_MAPPINGS.adminDashboard.manage}`}
              />
              Administrare Organizație
            </CardTitle>
            <CardDescription className="text-sm">
              Gestionați setările și configurările organizației
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="outline"
                borderRadius="full"
                className="h-auto p-4 flex-col"
              >
                <Users
                  className={`h-6 w-6 mb-2 ${ICON_COLOR_MAPPINGS.adminDashboard.users}`}
                />
                <span className="font-medium text-sm sm:text-base">
                  Gestionare Utilizatori
                </span>
                <span className="text-xs text-muted-foreground">
                  {organization.totalUsers} utilizatori
                </span>
              </Button>
              <Button
                variant="outline"
                borderRadius="full"
                className="h-auto p-4 flex-col"
              >
                <Crown
                  className={`h-6 w-6 mb-2 ${ICON_COLOR_MAPPINGS.adminDashboard.stats}`}
                />
                <span className="font-medium text-sm sm:text-base">
                  Plan Abonament
                </span>
                <span className="text-xs text-muted-foreground">
                  {organization.subscriptionPlan}
                </span>
              </Button>
              <Button
                variant="outline"
                borderRadius="full"
                className="h-auto p-4 flex-col sm:col-span-2 lg:col-span-1"
              >
                <BarChart3
                  className={`h-6 w-6 mb-2 ${ICON_COLOR_MAPPINGS.adminDashboard.stats}`}
                />
                <span className="font-medium text-sm sm:text-base">
                  Rapoarte & Analize
                </span>
                <span className="text-xs text-muted-foreground">
                  Vezi statistici
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Buildings List */}
        <PermissionGuardOr
          permissions={[
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`,
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.CREATE}`,
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.DELETE}`,
          ]}
        >
          <OrgBuildingsList
            organizationId={orgId}
            onAddBuilding={() => setShowAddBuilding(true)}
            onEditBuilding={(building) => {
              // TODO: Implement edit building functionality
              console.log("Edit building:", building);
            }}
            onDeleteBuilding={(building) => {
              // TODO: Implement delete building functionality
              console.log("Delete building:", building);
            }}
            onViewBuilding={(building) => {
              router.push(`/org/${orgId}/buildings/${building.id}`);
            }}
          />
        </PermissionGuardOr>
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
