"use client";

import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Search,
  MapPin,
  Home,
  Calendar,
  BarChart3,
  Eye,
  Plus,
} from "lucide-react";
import type { SafeUser } from "@/types/auth";
import {
  useApartmentsByOwner,
  useApartmentStats,
} from "@/hooks/api/use-apartments";
import { CreateApartmentModal } from "./create-apartment-modal";

interface UserApartmentsPageProps {
  user: SafeUser;
}

export function UserApartmentsPage({ user }: UserApartmentsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Get owner ID from user
  const ownerId = user.owner?.id;

  // Fetch apartments using React Query
  const {
    data: apartmentsResponse,
    isLoading,
    error,
  } = useApartmentsByOwner(ownerId);

  // Fetch apartment stats
  const { data: statsResponse, isLoading: isStatsLoading } =
    useApartmentStats();

  // Handle error state in useEffect to avoid calling toast during render
  useEffect(() => {
    if (error) {
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca apartamentele",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Extract apartments from response
  const apartments = useMemo(() => {
    return apartmentsResponse?.data?.apartments || [];
  }, [apartmentsResponse?.data?.apartments]);

  // Use stats from API response
  const stats = statsResponse?.data || {
    total: 0,
    withReadings: 0,
    vacant: 0,
    occupied: 0,
  };

  // Calculate unique buildings count from apartments data
  const uniqueBuildings = useMemo(() => {
    return new Set(apartments.map((apt) => apt.building.id)).size;
  }, [apartments]);

  // Filter apartments based on search term
  const filteredApartments = useMemo(() => {
    if (!searchTerm) return apartments;

    return apartments.filter(
      (apartment) =>
        apartment.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apartment.building.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        apartment.building.address
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [apartments, searchTerm]);

  if (isLoading || isStatsLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Apartamentele Mele
            </h1>
          </div>
          <p className="text-muted-foreground">
            Gestionează apartamentele tale și monitorizează consumurile
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 lg:grid-cols-4 gap-2 lg:gap-4 mb-6">
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-2 lg:p-4">
              <div className="flex lg:items-center lg:space-x-2">
                {/* Mobile: vertical layout with icon and value only */}
                <div className="flex flex-col items-center space-y-1 lg:hidden w-full">
                  <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <p className="text-lg font-bold text-foreground">
                    {stats.total}
                  </p>
                </div>
                {/* Desktop: horizontal layout with icon, label and value */}
                <div className="hidden lg:flex lg:items-center lg:space-x-2 w-full">
                  <Home className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">
                      Total Apartamente
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-2 lg:p-4">
              <div className="flex lg:items-center lg:space-x-2">
                {/* Mobile: vertical layout with icon and value only */}
                <div className="flex flex-col items-center space-y-1 lg:hidden w-full">
                  <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <p className="text-lg font-bold text-foreground">
                    {stats.withReadings}
                  </p>
                </div>
                {/* Desktop: horizontal layout with icon, label and value */}
                <div className="hidden lg:flex lg:items-center lg:space-x-2 w-full">
                  <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">
                      Cu Citiri
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.withReadings}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-2 lg:p-4">
              <div className="flex lg:items-center lg:space-x-2">
                {/* Mobile: vertical layout with icon and value only */}
                <div className="flex flex-col items-center space-y-1 lg:hidden w-full">
                  <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <p className="text-lg font-bold text-foreground">
                    {stats.vacant}
                  </p>
                </div>
                {/* Desktop: horizontal layout with icon, label and value */}
                <div className="hidden lg:flex lg:items-center lg:space-x-2 w-full">
                  <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">
                      Fără Citiri
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.vacant}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-2 lg:p-4">
              <div className="flex lg:items-center lg:space-x-2">
                {/* Mobile: vertical layout with icon and value only */}
                <div className="flex flex-col items-center space-y-1 lg:hidden w-full">
                  <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <p className="text-lg font-bold text-foreground">
                    {uniqueBuildings}
                  </p>
                </div>
                {/* Desktop: horizontal layout with icon, label and value */}
                <div className="hidden lg:flex lg:items-center lg:space-x-2 w-full">
                  <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">
                      Clădiri
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {uniqueBuildings}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută apartamente, clădiri sau adrese..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <CreateApartmentModal
            user={user}
            onSuccess={() => {
              // Refetch data after successful creation
              window.location.reload();
            }}
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adaugă Apartament
              </Button>
            }
          />
        </div>

        {/* Apartments Grid */}
        {filteredApartments.length === 0 ? (
          <Card className="p-8 text-center transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-8 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm
                  ? "Nu s-au găsit apartamente"
                  : "Nu aveți apartamente"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Încercați să modificați termenii de căutare"
                  : "Contactați administratorul pentru a vă asigna apartamente"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApartments.map((apartment) => (
              <Card
                key={apartment.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Apartament {apartment.number}
                    </CardTitle>
                    <Badge
                      variant={
                        apartment._count.waterReadings > 0
                          ? "default"
                          : "secondary"
                      }
                    >
                      {apartment._count.waterReadings > 0
                        ? "Cu citiri"
                        : "Fără citiri"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">
                      {apartment.building.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{apartment.building.address}</span>
                  </div>

                  {apartment.floor && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Home className="h-4 w-4" />
                      <span>Etajul {apartment.floor}</span>
                    </div>
                  )}

                  {apartment.rooms && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Home className="h-4 w-4" />
                      <span>{apartment.rooms} camere</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    <span>
                      {apartment._count.waterReadings} citiri înregistrate
                    </span>
                  </div>

                  <div className="pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        // TODO: Navigate to apartment details
                        toast({
                          title: "În dezvoltare",
                          description:
                            "Funcționalitatea va fi disponibilă în curând",
                        });
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Vezi Detalii
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
