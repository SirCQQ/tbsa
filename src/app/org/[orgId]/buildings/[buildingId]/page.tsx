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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  MapPin,
  Calendar,
  Home,
  ArrowLeft,
  Settings,
  Edit,
  Plus,
  CheckCircle2,
  XCircle,
  Zap,
  Filter,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useBuilding } from "@/hooks/api/use-buildings";
import { PermissionGuardOr } from "@/components/auth/permission-guard";
import { StatCard } from "@/components/ui/stat-card";
import { AddApartmentModal } from "@/components/apartments/add-apartment-modal";
import { GenerateApartmentsModal } from "@/components/apartments/generate-apartments-modal";
import { EditBuildingModal } from "@/components/admin/edit-building-modal";
import { ActionsEnum, ResourcesEnum } from "@prisma/client";
import { ICON_COLOR_MAPPINGS } from "@/lib/constants/icon-colors";
import { PageNavigation } from "@/components/ui/page-navigation";

export default function BuildingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  const buildingId = params.buildingId as string;

  const [showAddApartment, setShowAddApartment] = useState(false);
  const [showGenerateApartments, setShowGenerateApartments] = useState(false);
  const [showEditBuilding, setShowEditBuilding] = useState(false);
  const [occupancyFilter, setOccupancyFilter] = useState<string>("all");
  const [floorFilter, setFloorFilter] = useState<string>("all");

  const { data: building, isLoading, error } = useBuilding(buildingId, orgId);

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
        <div className="w-full space-y-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
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
              Nu s-au putut încărca informațiile despre clădire.
            </p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

  if (!building) {
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
            <CardTitle>Clădirea nu a fost găsită</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Clădirea solicitată nu există sau nu aveți permisiunile necesare.
            </p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

  // Sort floors for display (ground floor first, then ascending)
  const sortedFloors = Object.keys(building.apartmentsByFloor)
    .map(Number)
    .sort((a, b) => a - b);

  // Filter apartments based on selected filters
  const getFilteredApartments = (apartments: any[]) => {
    return apartments.filter((apartment) => {
      // Occupancy filter
      if (occupancyFilter === "occupied" && !apartment.isOccupied) return false;
      if (occupancyFilter === "vacant" && apartment.isOccupied) return false;

      return true;
    });
  };

  // Filter floors based on floor filter
  const getFilteredFloors = () => {
    if (floorFilter === "all") return sortedFloors;
    return sortedFloors.filter((floor) => floor.toString() === floorFilter);
  };

  const filteredFloors = getFilteredFloors();

  // Check if there are any apartments matching the current filters
  const hasFilteredApartments = filteredFloors.some((floor) => {
    const apartments = getFilteredApartments(
      building.apartmentsByFloor[floor.toString()]
    );
    return apartments.length > 0;
  });

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
        {/* Header */}
        <div className="space-y-4 sm:space-y-6">
          {/* Breadcrumb Navigation */}
          <PageNavigation
            title={`${building.name} - Detalii Clădire`}
            className="mb-4"
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div>
                <Typography
                  variant="h1"
                  gradient="blue"
                  className="text-2xl sm:text-3xl lg:text-4xl"
                >
                  {building.name}
                </Typography>
                <Typography
                  variant="p"
                  className="text-muted-foreground text-sm sm:text-base"
                >
                  Cod: {building.code}
                </Typography>
              </div>
            </div>

            {/* Action Buttons - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-2">
              <PermissionGuardOr
                permissions={[
                  `${ResourcesEnum.BUILDINGS}:${ActionsEnum.UPDATE}`,
                ]}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setShowEditBuilding(true)}
                >
                  <Edit
                    className={`h-4 w-4 mr-2 ${ICON_COLOR_MAPPINGS.buildingPage.edit}`}
                  />
                  <span className="sm:inline">Editează</span>
                </Button>
              </PermissionGuardOr>
              <PermissionGuardOr
                permissions={[
                  `${ResourcesEnum.BUILDINGS}:${ActionsEnum.UPDATE}`,
                ]}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Settings
                    className={`h-4 w-4 mr-2 ${ICON_COLOR_MAPPINGS.buildingPage.settings}`}
                  />
                  <span className="sm:inline">Setări</span>
                </Button>
              </PermissionGuardOr>
            </div>
          </div>

          {/* Building Details Card */}
          <Card className="backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Building2
                  className={`h-5 w-5 ${ICON_COLOR_MAPPINGS.buildingPage.building}`}
                />
                Informații Clădire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                    TIP CLĂDIRE
                  </h4>
                  <p className="font-semibold text-sm sm:text-base">
                    {building.type}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                    ETAJE
                  </h4>
                  <p className="font-semibold text-sm sm:text-base">
                    {building.floors}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                    ZI CITIRE
                  </h4>
                  <div className="flex items-center gap-2">
                    <Calendar
                      className={`h-4 w-4 ${ICON_COLOR_MAPPINGS.buildingPage.calendar}`}
                    />
                    <span className="text-sm sm:text-base">
                      Ziua {building.readingDay} din lună
                    </span>
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                  <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                    ADRESĂ
                  </h4>
                  <div className="flex items-start gap-2">
                    <MapPin
                      className={`h-4 w-4 ${ICON_COLOR_MAPPINGS.buildingPage.address} mt-0.5`}
                    />
                    <span className="text-sm sm:text-base">
                      {building.address}
                    </span>
                  </div>
                </div>
                {building.description && (
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                      DESCRIERE
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {building.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview - Responsive grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatCard
            title="Total Apartamente"
            value={building.totalApartments.toString()}
            description="Unități locative"
            icon={Home}
            iconColor={ICON_COLOR_MAPPINGS.buildingPage.totalApartments}
          />
          <StatCard
            title="Apartamente Ocupate"
            value={building.occupiedApartments.toString()}
            description="Unități cu proprietari"
            icon={CheckCircle2}
            iconColor={ICON_COLOR_MAPPINGS.buildingPage.occupiedApartments}
            trend={{
              value: Math.round(
                (building.occupiedApartments / building.totalApartments) * 100
              ),
              label: "rata de ocupare",
              type: "neutral",
            }}
          />
          <StatCard
            title="Apartamente Libere"
            value={building.vacantApartments.toString()}
            description="Unități disponibile"
            icon={XCircle}
            iconColor={ICON_COLOR_MAPPINGS.buildingPage.vacantApartments}
          />
          <StatCard
            title="Etaje"
            value={building.floors.toString()}
            description="Nivele clădire"
            icon={Building2}
            iconColor={ICON_COLOR_MAPPINGS.buildingPage.floors}
          />
        </div>

        {/* Apartments by Floor */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Typography variant="h2" className="text-xl sm:text-2xl">
              Apartamente pe Etaje
            </Typography>
            <div className="flex flex-col sm:flex-row gap-2">
              <PermissionGuardOr
                permissions={[
                  `${ResourcesEnum.APARTMENTS}:${ActionsEnum.CREATE}`,
                ]}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowGenerateApartments(true)}
                  className="w-full sm:w-auto"
                >
                  <Zap
                    className={`h-4 w-4 mr-2 ${ICON_COLOR_MAPPINGS.buildingPage.generate}`}
                  />
                  <span className="hidden sm:inline">
                    Generează Apartamente
                  </span>
                  <span className="sm:hidden">Generează</span>
                </Button>
              </PermissionGuardOr>
              <PermissionGuardOr
                permissions={[
                  `${ResourcesEnum.APARTMENTS}:${ActionsEnum.CREATE}`,
                ]}
              >
                <Button
                  size="sm"
                  onClick={() => setShowAddApartment(true)}
                  className="w-full sm:w-auto"
                >
                  <Plus
                    className={`h-4 w-4 mr-2 ${ICON_COLOR_MAPPINGS.buildingPage.add}`}
                  />
                  <span className="hidden sm:inline">Adaugă Apartament</span>
                  <span className="sm:hidden">Adaugă</span>
                </Button>
              </PermissionGuardOr>
            </div>
          </div>

          {/* Filters */}
          <Card className="backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Filtrează:</span>
                </div>

                <div className="flex flex-row  gap-8 md:gap-3 flex-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                      Ocupare
                    </label>
                    <Select
                      value={occupancyFilter}
                      onValueChange={setOccupancyFilter}
                    >
                      <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="Toate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toate</SelectItem>
                        <SelectItem value="occupied">Ocupate</SelectItem>
                        <SelectItem value="vacant">Libere</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                      Etaj
                    </label>
                    <Select value={floorFilter} onValueChange={setFloorFilter}>
                      <SelectTrigger className="w-full sm:w-[120px]">
                        <SelectValue placeholder="Toate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toate</SelectItem>
                        {sortedFloors.map((floor) => (
                          <SelectItem key={floor} value={floor.toString()}>
                            {floor === 0 ? "Parter" : `Etaj ${floor}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(occupancyFilter !== "all" || floorFilter !== "all") && (
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOccupancyFilter("all");
                          setFloorFilter("all");
                        }}
                        className="text-xs"
                      >
                        Resetează
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* No Results Fallback */}
          {!hasFilteredApartments &&
            (occupancyFilter !== "all" || floorFilter !== "all") && (
              <Card className="backdrop-blur-md">
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                      <Filter className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <Typography
                        variant="h3"
                        className="text-lg font-semibold"
                      >
                        Nu s-au găsit apartamente
                      </Typography>
                      <Typography
                        variant="p"
                        className="text-muted-foreground text-sm"
                      >
                        Nu există apartamente care să corespundă filtrelor
                        selectate.
                      </Typography>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
                      <span>Filtre active:</span>
                      <div className="flex flex-wrap gap-2">
                        {occupancyFilter !== "all" && (
                          <Badge variant="outline" className="text-xs">
                            {occupancyFilter === "occupied"
                              ? "Ocupate"
                              : "Libere"}
                          </Badge>
                        )}
                        {floorFilter !== "all" && (
                          <Badge variant="outline" className="text-xs">
                            {floorFilter === "0"
                              ? "Parter"
                              : `Etaj ${floorFilter}`}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setOccupancyFilter("all");
                        setFloorFilter("all");
                      }}
                      className="mt-2"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Resetează filtrele
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

          <div className="space-y-4">
            {filteredFloors.map((floor) => {
              const apartments = getFilteredApartments(
                building.apartmentsByFloor[floor.toString()]
              );
              const floorName = floor === 0 ? "Parter" : `Etaj ${floor}`;

              // Skip floors with no apartments after filtering
              if (apartments.length === 0) return null;

              return (
                <Card key={floor} className="backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-lg sm:text-xl">{floorName}</span>
                      <Badge
                        variant="secondary"
                        className="self-start sm:self-auto"
                      >
                        {apartments.length} apartamente
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Apartamente de la etajul {floor === 0 ? "parter" : floor}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                      {apartments.map((apartment) => (
                        <PermissionGuardOr
                          key={apartment.id}
                          permissions={[
                            `${ResourcesEnum.APARTMENTS}:${ActionsEnum.READ}`,
                          ]}
                          fallback={
                            <Card className="h-36 transition-all backdrop-blur-md">
                              <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-sm">
                                    Ap. {apartment.number}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${
                                      apartment.isOccupied
                                        ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800"
                                        : "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-800"
                                    }`}
                                  >
                                    {apartment.isOccupied ? "Ocupat" : "Liber"}
                                  </Badge>
                                </div>
                                <div className="space-y-1 text-xs text-muted-foreground">
                                  {apartment.occupantCount > 0 && (
                                    <div>
                                      Ocupanți: {apartment.occupantCount}{" "}
                                      {apartment.occupantCount === 1
                                        ? "pers."
                                        : "pers."}
                                    </div>
                                  )}
                                  {apartment.surface && (
                                    <div>Suprafață: {apartment.surface} m²</div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          }
                        >
                          <Card
                            className="h-32 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] backdrop-blur-md"
                            onClick={() =>
                              router.push(
                                `/org/${orgId}/buildings/${buildingId}/apartments/${apartment.id}`
                              )
                            }
                          >
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-sm">
                                  Ap. {apartment.number}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${
                                    apartment.isOccupied
                                      ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800"
                                      : "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-800"
                                  }`}
                                >
                                  {apartment.isOccupied ? "Ocupat" : "Liber"}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-xs text-muted-foreground">
                                {apartment.occupantCount > 0 && (
                                  <div>
                                    Ocupanți: {apartment.occupantCount}{" "}
                                    {apartment.occupantCount === 1
                                      ? "pers."
                                      : "pers."}
                                  </div>
                                )}
                                {apartment.surface && (
                                  <div>Suprafață: {apartment.surface} m²</div>
                                )}
                                <div className="text-primary text-xs font-medium pt-1 hidden sm:block">
                                  Click pentru detalii →
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </PermissionGuardOr>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Apartment Modal */}
      <AddApartmentModal
        open={showAddApartment}
        onOpenChange={setShowAddApartment}
        buildingId={buildingId}
        buildingName={building.name}
        maxFloor={building.floors}
      />

      {/* Generate Apartments Modal */}
      <GenerateApartmentsModal
        open={showGenerateApartments}
        onOpenChange={setShowGenerateApartments}
        buildingId={buildingId}
        buildingName={building.name}
        floors={building.floors}
      />

      {/* Edit Building Modal */}
      <EditBuildingModal
        open={showEditBuilding}
        onOpenChange={setShowEditBuilding}
        building={building}
      />
    </Page>
  );
}
