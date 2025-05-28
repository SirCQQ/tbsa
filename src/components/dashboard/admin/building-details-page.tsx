"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  Home,
  ArrowLeft,
  Edit,
  Plus,
  Car,
  Trees,
  ArrowUp,
  AlertTriangle,
  Droplets,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBuilding } from "@/hooks/api/use-buildings";
import { useApartmentsByBuilding } from "@/hooks/api/use-apartments";
import { useBuildingConsumption } from "@/hooks/api/use-building-consumption";
import { AdminHeader } from "@/components/dashboard";
import { useAuth } from "@/contexts/auth-context";

type BuildingDetailsPageProps = {
  buildingId: string;
};

export function BuildingDetailsPage({ buildingId }: BuildingDetailsPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  // Fetch building details
  const {
    data: buildingResponse,
    isLoading: buildingLoading,
    error: buildingError,
  } = useBuilding(buildingId);

  // Fetch apartments for this building
  const {
    data: apartmentsResponse,
    isLoading: apartmentsLoading,
    error: apartmentsError,
  } = useApartmentsByBuilding(buildingId);

  // Fetch water consumption statistics
  const {
    data: consumptionData,
    isLoading: consumptionLoading,
    error: consumptionError,
  } = useBuildingConsumption(buildingId);

  const building = buildingResponse?.data;
  const apartments = apartmentsResponse?.data || [];

  // Group apartments by floor
  const apartmentsByFloor = apartments.reduce((groups, apartment) => {
    const floor = apartment.floor ?? 0;
    if (!groups[floor]) {
      groups[floor] = [];
    }
    groups[floor].push(apartment);
    return groups;
  }, {} as Record<number, typeof apartments>);

  // Sort floors
  const floors = Object.keys(apartmentsByFloor)
    .map(Number)
    .sort((a, b) => a - b);

  // Sort apartments within each floor
  Object.values(apartmentsByFloor).forEach((floorApartments) => {
    floorApartments.sort((a, b) => {
      const numA = parseInt(a.number) || 0;
      const numB = parseInt(b.number) || 0;
      return numA - numB;
    });
  });

  // Calculate stats
  const stats = {
    totalApartments: apartments.length,
    occupiedApartments: apartments.filter((apt) => apt.ownerId).length,
    totalFloors: floors.length,
    totalReadings: apartments.reduce(
      (sum, apt) => sum + (apt._count?.waterReadings || 0),
      0
    ),
  };

  // Helper function to get month name in Romanian
  const getMonthName = (month: number) => {
    const months = [
      "Ianuarie",
      "Februarie",
      "Martie",
      "Aprilie",
      "Mai",
      "Iunie",
      "Iulie",
      "August",
      "Septembrie",
      "Octombrie",
      "Noiembrie",
      "Decembrie",
    ];
    return months[month - 1] || `Luna ${month}`;
  };

  if (buildingLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {user && <AdminHeader user={user} />}
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (buildingError || !building) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {user && <AdminHeader user={user} />}
          <Card className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Eroare la încărcarea clădirii
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Nu s-au putut încărca detaliile clădirii.
            </p>
            <Button onClick={() => router.back()} variant="outline">
              Înapoi
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {user && <AdminHeader user={user} />}

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {building.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{building.city}</p>
          </div>
          <Button className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editează
          </Button>
        </div>

        {/* Building Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informații Clădire
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{building.address}</span>
                </div>
                {building.postalCode && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Cod poștal:</span>
                    <span>{building.postalCode}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Termen citiri: ziua {building.readingDeadline}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Administrator:</span>
                  <span>
                    {building.administrator.user.firstName}{" "}
                    {building.administrator.user.lastName}
                  </span>
                </div>

                {/* Facilities */}
                <div className="pt-4">
                  <h4 className="font-medium mb-2">Facilități</h4>
                  <div className="flex flex-wrap gap-2">
                    {building.hasElevator && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <ArrowUp className="h-3 w-3" />
                        Lift
                      </Badge>
                    )}
                    {building.hasParking && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Car className="h-3 w-3" />
                        Parcare
                      </Badge>
                    )}
                    {building.hasGarden && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Trees className="h-3 w-3" />
                        Grădină
                      </Badge>
                    )}
                    {!building.hasElevator &&
                      !building.hasParking &&
                      !building.hasGarden && (
                        <span className="text-sm text-gray-500">
                          Nicio facilitate
                        </span>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Apartamente
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.totalApartments}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Apartamente Ocupate
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.occupiedApartments}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Etaje
                    </p>
                    <p className="text-2xl font-bold">{stats.totalFloors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Water Consumption Statistics */}
        {consumptionData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Last Month Consumption */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Consum Luna Trecută
                    </p>
                    <p className="text-xs text-gray-500">
                      {getMonthName(consumptionData.lastMonth.month)}{" "}
                      {consumptionData.lastMonth.year}
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {consumptionData.lastMonth.total.toFixed(1)} m³
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {consumptionData.lastMonth.readingsCount} citiri
                </p>
                {consumptionData.lastMonth.average > 0 && (
                  <p className="text-xs text-gray-500">
                    Medie: {consumptionData.lastMonth.average.toFixed(1)} m³/apt
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 6 Months Consumption */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Consum Ultimele 6 Luni
                    </p>
                    <p className="text-xs text-gray-500">Total acumulat</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {consumptionData.sixMonths.total.toFixed(1)} m³
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {consumptionData.sixMonths.readingsCount} citiri
                </p>
                {consumptionData.sixMonths.monthlyAverage > 0 && (
                  <p className="text-xs text-gray-500">
                    Medie lunară:{" "}
                    {consumptionData.sixMonths.monthlyAverage.toFixed(1)} m³
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Monthly Average */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Medie Lunară per Apartament
                    </p>
                    <p className="text-xs text-gray-500">Ultimele 6 luni</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {consumptionData.sixMonths.average.toFixed(1)} m³
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {consumptionData.buildingInfo.occupiedApartments} apartamente
                  ocupate
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading state for consumption data */}
        {consumptionLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error state for consumption data */}
        {consumptionError && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  Nu s-au putut încărca statisticile de consum de apă
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Apartments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Apartamente ({stats.totalApartments})
              </CardTitle>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adaugă Apartament
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {apartmentsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Se încarcă apartamentele...</p>
              </div>
            ) : apartments.length === 0 ? (
              <div className="text-center py-8">
                <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Niciun apartament
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Această clădire nu are apartamente înregistrate.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adaugă primul apartament
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Floor Filter */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedFloor === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFloor(null)}
                  >
                    Toate etajele
                  </Button>
                  {floors.map((floor) => (
                    <Button
                      key={floor}
                      variant={selectedFloor === floor ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFloor(floor)}
                    >
                      {floor === 0 ? "Parter" : `Etaj ${floor}`} (
                      {apartmentsByFloor[floor].length})
                    </Button>
                  ))}
                </div>

                {/* Apartments Grid */}
                <div className="space-y-6">
                  {floors
                    .filter(
                      (floor) =>
                        selectedFloor === null || floor === selectedFloor
                    )
                    .map((floor) => (
                      <div key={floor}>
                        <h3 className="text-lg font-semibold mb-3">
                          {floor === 0 ? "Parter" : `Etaj ${floor}`}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {apartmentsByFloor[floor].map((apartment) => (
                            <Card
                              key={apartment.id}
                              className="hover:shadow-md transition-shadow"
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold">
                                    Apt. {apartment.number}
                                  </h4>
                                  <Badge
                                    variant={
                                      apartment.ownerId
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {apartment.ownerId ? "Ocupat" : "Liber"}
                                  </Badge>
                                </div>
                                {apartment.rooms && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {apartment.rooms} camere
                                  </p>
                                )}
                                {apartment.owner && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Proprietar: {apartment.owner.user.firstName}{" "}
                                    {apartment.owner.user.lastName}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                  {apartment._count?.waterReadings || 0} citiri
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
