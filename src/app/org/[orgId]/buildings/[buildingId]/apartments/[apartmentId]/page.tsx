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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Home,
  ArrowLeft,
  Edit,
  Settings,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  User,
  Droplets,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useApartment } from "@/hooks/api/use-apartments";
import { useBuilding } from "@/hooks/api/use-buildings";
import { PermissionGuardOr } from "@/components/auth/permission-guard";
import { StatCard } from "@/components/ui/stat-card";
import { ActionsEnum, ResourcesEnum } from "@prisma/client";
import { ICON_COLOR_MAPPINGS } from "@/lib/constants/icon-colors";
import { PageNavigation } from "@/components/ui/page-navigation";

export default function ApartmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  const buildingId = params.buildingId as string;
  const apartmentId = params.apartmentId as string;

  const {
    data: apartment,
    isLoading: apartmentLoading,
    error: apartmentError,
  } = useApartment(apartmentId);
  const { data: building, isLoading: buildingLoading } = useBuilding(
    buildingId,
    orgId
  );

  const isLoading = apartmentLoading || buildingLoading;
  const error = apartmentError;

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

  if (error || !apartment) {
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
              Nu s-au putut încărca informațiile despre apartament.
            </p>
            <Button
              onClick={() =>
                router.push(`/org/${orgId}/buildings/${buildingId}`)
              }
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi la Clădire
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

  const floorDisplay =
    apartment.floor === 0 ? "Parter" : `Etaj ${apartment.floor}`;

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
          <PageNavigation
            title={`Apartament ${apartment.number}`}
            className="mb-4"
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Typography
                variant="h1"
                gradient="blue"
                className="text-2xl sm:text-3xl lg:text-4xl"
              >
                Apartament {apartment.number}
              </Typography>
              <Typography
                variant="p"
                className="text-muted-foreground text-sm sm:text-base"
              >
                {building?.name} • {floorDisplay}
              </Typography>
            </div>

            {/* Action Buttons - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-2">
              <PermissionGuardOr
                permissions={[
                  `${ResourcesEnum.APARTMENTS}:${ActionsEnum.UPDATE}`,
                ]}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="sm:inline">Editează</span>
                </Button>
              </PermissionGuardOr>
              <PermissionGuardOr
                permissions={[
                  `${ResourcesEnum.APARTMENTS}:${ActionsEnum.UPDATE}`,
                ]}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Settings className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="sm:inline">Setări</span>
                </Button>
              </PermissionGuardOr>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant={apartment.isOccupied ? "default" : "secondary"}
              className={
                apartment.isOccupied
                  ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100"
                  : ""
              }
            >
              {apartment.isOccupied ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Apartament Ocupat
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Apartament Liber
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Stats Overview - Responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
          <StatCard
            title="Nr. Apartament"
            value={apartment.number}
            description="Identificator unic"
            icon={Home}
            iconColor={ICON_COLOR_MAPPINGS.apartmentPage.apartment}
          />
          <StatCard
            title="Etaj"
            value={floorDisplay}
            description="Locația în clădire"
            icon={Building2}
            iconColor={ICON_COLOR_MAPPINGS.apartmentPage.floor}
          />
          <StatCard
            title="Ocupanți"
            value={apartment.occupantCount.toString()}
            description={
              apartment.occupantCount === 1 ? "persoană" : "persoane"
            }
            icon={User}
            iconColor={ICON_COLOR_MAPPINGS.apartmentPage.occupants}
            trend={
              apartment.occupantCount > 0
                ? {
                    value: apartment.occupantCount,
                    label:
                      apartment.occupantCount === 1 ? "persoană" : "persoane",
                    type: "neutral" as const,
                  }
                : undefined
            }
          />
          <StatCard
            title="Suprafața"
            value={apartment.surface ? `${apartment.surface} m²` : "N/A"}
            description="Aria locuibilă"
            icon={MapPin}
            iconColor={ICON_COLOR_MAPPINGS.apartmentPage.surface}
          />
          <div className="col-span-2 sm:col-span-1">
            <StatCard
              title="Status"
              value={apartment.isOccupied ? "Ocupat" : "Liber"}
              description="Starea actuală"
              icon={apartment.isOccupied ? CheckCircle2 : XCircle}
              iconColor={
                apartment.isOccupied
                  ? ICON_COLOR_MAPPINGS.apartmentPage.status.occupied
                  : ICON_COLOR_MAPPINGS.apartmentPage.status.vacant
              }
              trend={
                apartment.isOccupied
                  ? {
                      value: 100,
                      label: "ocupat",
                      type: "positive" as const,
                    }
                  : undefined
              }
            />
          </div>
        </div>

        {/* Apartment Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card className="backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Home
                  className={`h-5 w-5 ${ICON_COLOR_MAPPINGS.apartmentPage.apartment}`}
                />
                Informații Apartament
              </CardTitle>
              <CardDescription className="text-sm">
                Detalii despre apartamentul {apartment.number}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                      NUMĂRUL APARTAMENTULUI
                    </h4>
                    <p className="font-semibold text-sm sm:text-base">
                      {apartment.number}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                      ETAJ
                    </h4>
                    <p className="font-semibold text-sm sm:text-base">
                      {floorDisplay}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                      SUPRAFAȚA
                    </h4>
                    <p className="font-semibold text-sm sm:text-base">
                      {apartment.surface
                        ? `${apartment.surface} m²`
                        : "Nu este specificată"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                      NUMĂRUL DE OCUPANȚI
                    </h4>
                    <div className="flex items-center gap-2">
                      <User
                        className={`h-4 w-4 ${ICON_COLOR_MAPPINGS.apartmentPage.occupants}`}
                      />
                      <span className="font-semibold text-sm sm:text-base">
                        {apartment.occupantCount}{" "}
                        {apartment.occupantCount === 1
                          ? "persoană"
                          : "persoane"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                      STATUS OCUPARE
                    </h4>
                    <div className="flex items-center gap-2">
                      {apartment.isOccupied ? (
                        <>
                          <CheckCircle2
                            className={`h-4 w-4 ${ICON_COLOR_MAPPINGS.apartmentPage.status.occupied.replace("text-", "text-").replace("500", "600")}`}
                          />
                          <span className="text-green-600 font-medium text-sm sm:text-base">
                            Ocupat
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle
                            className={`h-4 w-4 ${ICON_COLOR_MAPPINGS.apartmentPage.status.vacant.replace("text-", "text-").replace("500", "600")}`}
                          />
                          <span className="text-orange-600 font-medium text-sm sm:text-base">
                            Liber
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {apartment.description && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                      DESCRIERE
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {apartment.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                      CREAT LA
                    </h4>
                    <p className="text-xs sm:text-sm">
                      {new Date(apartment.createdAt).toLocaleDateString(
                        "ro-RO",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                      ACTUALIZAT LA
                    </h4>
                    <p className="text-xs sm:text-sm">
                      {new Date(apartment.updatedAt).toLocaleDateString(
                        "ro-RO",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Building Context */}
          {building && (
            <Card className="backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Building2
                    className={`h-5 w-5 ${ICON_COLOR_MAPPINGS.apartmentPage.building}`}
                  />
                  Informații Clădire
                </CardTitle>
                <CardDescription className="text-sm">
                  Contextul clădirii în care se află apartamentul
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                      NUMELE CLĂDIRII
                    </h4>
                    <p className="font-semibold text-sm sm:text-base">
                      {building.name}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                      CODUL CLĂDIRII
                    </h4>
                    <p className="font-semibold text-sm sm:text-base">
                      {building.code}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                      ADRESA
                    </h4>
                    <div className="flex items-start gap-2">
                      <MapPin
                        className={`h-4 w-4 ${ICON_COLOR_MAPPINGS.apartmentPage.surface} mt-0.5`}
                      />
                      <span className="text-xs sm:text-sm">
                        {building.address}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                        TOTAL ETAJE
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
                          className={`h-4 w-4 ${ICON_COLOR_MAPPINGS.apartmentPage.calendar}`}
                        />
                        <span className="text-xs sm:text-sm">
                          Ziua {building.readingDay}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/org/${orgId}/buildings/${buildingId}`)
                      }
                      className="w-full"
                    >
                      <Building2 className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-xs sm:text-sm">
                        Vezi Toate Apartamentele din Clădire
                      </span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Residents Section (Placeholder) */}
        <Card className="backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <User className="h-5 w-5 text-indigo-500" />
              Rezidenți
            </CardTitle>
            <CardDescription className="text-sm">
              Persoanele care locuiesc în acest apartament
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apartment.isOccupied ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs sm:text-sm">
                  Funcționalitatea de gestionare a rezidenților va fi
                  implementată în curând. Apartamentul este marcat ca ocupat.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs sm:text-sm">
                  Acest apartament este momentan liber. Nu există rezidenți
                  înregistrați.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Water Meters Section (Placeholder) */}
        <Card className="backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Droplets
                className={`h-5 w-5 ${ICON_COLOR_MAPPINGS.apartmentPage.water}`}
              />
              Contoare Apă
            </CardTitle>
            <CardDescription className="text-sm">
              Contoarele de apă asociate acestui apartament
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs sm:text-sm">
                Funcționalitatea de gestionare a contoarelor de apă va fi
                implementată în curând.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Quick Actions - Mobile optimized */}
        <div className="flex flex-col sm:flex-row sm:justify-center gap-3">
          <PermissionGuardOr
            permissions={[`${ResourcesEnum.APARTMENTS}:${ActionsEnum.UPDATE}`]}
          >
            <Button variant="outline" className="w-full sm:w-auto">
              <Edit className="h-4 w-4 mr-2" />
              Editează Apartament
            </Button>
          </PermissionGuardOr>
          <PermissionGuardOr
            permissions={[`${ResourcesEnum.APARTMENTS}:${ActionsEnum.UPDATE}`]}
          >
            <Button variant="outline" className="w-full sm:w-auto">
              <User className="h-4 w-4 mr-2" />
              Gestionează Rezidenți
            </Button>
          </PermissionGuardOr>
          <PermissionGuardOr
            permissions={[`${ResourcesEnum.APARTMENTS}:${ActionsEnum.UPDATE}`]}
          >
            <Button variant="outline" className="w-full sm:w-auto">
              <Droplets className="h-4 w-4 mr-2" />
              Gestionează Contoare
            </Button>
          </PermissionGuardOr>
        </div>
      </div>
    </Page>
  );
}
