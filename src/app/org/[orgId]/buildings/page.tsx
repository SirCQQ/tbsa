"use client";

import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Home,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useBuildings } from "@/hooks/api/use-buildings";
import { PermissionGuardOr } from "@/components/auth/permission-guard";
import { StatCard } from "@/components/ui/stat-card";
import { AddBuildingModal } from "@/components/admin/add-building-modal";
import { ActionsEnum, ResourcesEnum } from "@prisma/client";
import { ICON_COLOR_MAPPINGS } from "@/lib/constants/icon-colors";
import { PageNavigation } from "@/components/ui/page-navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BuildingsPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;

  const [showAddBuilding, setShowAddBuilding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: buildings, isLoading, error } = useBuildings();

  // Filter buildings based on search and filter criteria
  const filteredBuildings = (buildings || []).filter((building) => {
    const matchesSearch =
      building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      building.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      building.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterType === "all" || building.type === filterType;

    return matchesSearch && matchesFilter;
  });

  // Calculate summary statistics
  const totalBuildings = (buildings || []).length;
  const totalApartments = (buildings || []).reduce(
    (sum, building) => sum + (building.totalApartments || 0),
    0
  );
  const occupiedApartments = (buildings || []).reduce(
    (sum, building) =>
      sum + (building.apartments?.filter((apt) => apt.isOccupied).length || 0),
    0
  );
  const buildingTypes = [...new Set((buildings || []).map((b) => b.type))];

  if (isLoading) {
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
          <PageNavigation title="Clădiri" className="mb-4" />

          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          </div>
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page
        display="flex"
        justifyContent="center"
        alignItems="center"
        background="gradient-ocean"
        padding="lg"
        container="7xl"
        className="py-24"
      >
        <Card className="backdrop-blur-md max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Eroare</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Nu s-au putut încărca clădirile organizației.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Încearcă din nou
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

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
        {/* Header with Breadcrumbs */}
        <div className="space-y-4 sm:space-y-6">
          <PageNavigation title="Clădiri" className="mb-4" />

          <div className="hidden flex-col sm:flex-row sm:items-center sm:justify-between gap-4 lg:flex">
            <div>
              <Typography
                variant="h1"
                gradient="blue"
                className="text-2xl sm:text-3xl lg:text-4xl"
              >
                Clădiri
              </Typography>
              <Typography
                variant="p"
                className="text-muted-foreground text-sm sm:text-base"
              >
                Gestionați clădirile din organizația dumneavoastră
              </Typography>
            </div>

            <PermissionGuardOr
              permissions={[`${ResourcesEnum.BUILDINGS}:${ActionsEnum.CREATE}`]}
            >
              <Button
                onClick={() => setShowAddBuilding(true)}
                borderRadius="full"
                className="w-full sm:w-auto"
              >
                <Plus
                  className={`h-4 w-4 mr-2 ${ICON_COLOR_MAPPINGS.adminDashboard.add}`}
                />
                Adaugă Clădire
              </Button>
            </PermissionGuardOr>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total Clădiri"
            value={totalBuildings.toString()}
            description="Clădiri administrate"
            icon={Building2}
            iconColor={ICON_COLOR_MAPPINGS.adminDashboard.buildings}
          />
          <StatCard
            title="Total Apartamente"
            value={totalApartments.toString()}
            description="Unități locative"
            icon={Home}
            iconColor={ICON_COLOR_MAPPINGS.adminDashboard.apartments}
          />
          <StatCard
            title="Apartamente Ocupate"
            value={occupiedApartments.toString()}
            description="Unități cu proprietari"
            icon={Users}
            iconColor={ICON_COLOR_MAPPINGS.adminDashboard.users}
            trend={{
              value:
                totalApartments > 0
                  ? Math.round((occupiedApartments / totalApartments) * 100)
                  : 0,
              label: "rata de ocupare",
              type: "neutral",
            }}
          />
          <StatCard
            title="Tipuri Clădiri"
            value={buildingTypes.length.toString()}
            description="Tipuri diferite"
            icon={Building2}
            iconColor={ICON_COLOR_MAPPINGS.adminDashboard.stats}
          />
        </div>

        {/* Search and Filters */}
        <Card className="backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Search
                className={`h-5 w-5 ${ICON_COLOR_MAPPINGS.adminDashboard.stats}`}
              />
              Căutare și Filtrare
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Căutați după nume, cod sau adresă..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Tip clădire" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate tipurile</SelectItem>
                    <SelectItem value="RESIDENTIAL">Rezidențial</SelectItem>
                    <SelectItem value="COMMERCIAL">Comercial</SelectItem>
                    <SelectItem value="MIXED">Mixt</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buildings List */}
        {filteredBuildings.length === 0 ? (
          <Card className="backdrop-blur-md">
            <CardContent className="py-16 text-center">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <Typography variant="h3" className="mb-2">
                {searchQuery || filterType !== "all"
                  ? "Nu s-au găsit clădiri"
                  : "Nicio clădire"}
              </Typography>
              <Typography variant="p" className="text-muted-foreground mb-6">
                {searchQuery || filterType !== "all"
                  ? "Încercați să modificați criteriile de căutare sau filtrele."
                  : "Începeți prin a adăuga prima clădire în organizația dumneavoastră."}
              </Typography>
              {!searchQuery && filterType === "all" && (
                <PermissionGuardOr
                  permissions={[
                    `${ResourcesEnum.BUILDINGS}:${ActionsEnum.CREATE}`,
                  ]}
                >
                  <Button
                    onClick={() => setShowAddBuilding(true)}
                    borderRadius="full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adaugă Prima Clădire
                  </Button>
                </PermissionGuardOr>
              )}
            </CardContent>
          </Card>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredBuildings.map((building) => (
              <Card
                key={building.id}
                className="backdrop-blur-md hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Building2
                          className={`h-5 w-5 ${ICON_COLOR_MAPPINGS.adminDashboard.buildings}`}
                        />
                        {building.name}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        Cod: {building.code}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {building.type === "RESIDENTIAL"
                        ? "Rezidențial"
                        : building.type === "COMMERCIAL"
                          ? "Comercial"
                          : "Mixt"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Address */}
                    <div className="flex items-start gap-2">
                      <MapPin
                        className={`h-4 w-4 ${ICON_COLOR_MAPPINGS.adminDashboard.stats} mt-0.5 flex-shrink-0`}
                      />
                      <span className="text-sm text-muted-foreground">
                        {building.address}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold">
                          {building.floors}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Etaje
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {building.totalApartments}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Apartamente
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {building.totalApartments > 0
                            ? Math.round(
                                ((building.apartments?.filter(
                                  (apt) => apt.isOccupied
                                ).length || 0) /
                                  building.totalApartments) *
                                  100
                              )
                            : 0}
                          %
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Ocupare
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <PermissionGuardOr
                        permissions={[
                          `${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`,
                        ]}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/org/${orgId}/buildings/${building.id}`
                            )
                          }
                          className="flex-1"
                        >
                          <Eye
                            className={`h-4 w-4 mr-2 ${ICON_COLOR_MAPPINGS.adminDashboard.stats}`}
                          />
                          Vezi
                        </Button>
                      </PermissionGuardOr>
                      <PermissionGuardOr
                        permissions={[
                          `${ResourcesEnum.BUILDINGS}:${ActionsEnum.UPDATE}`,
                        ]}
                      >
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit
                            className={`h-4 w-4 mr-2 ${ICON_COLOR_MAPPINGS.adminDashboard.manage}`}
                          />
                          Editează
                        </Button>
                      </PermissionGuardOr>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Building Modal */}
        <AddBuildingModal
          open={showAddBuilding}
          onOpenChange={setShowAddBuilding}
          organizationId={orgId}
        />
      </div>
    </Page>
  );
}
