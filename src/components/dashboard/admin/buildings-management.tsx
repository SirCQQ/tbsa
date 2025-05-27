"use client";

import { useState } from "react";
import { Building2, Search, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useBuildings, useDeleteBuilding } from "@/hooks/api/use-buildings";
import { useDebounce } from "@/hooks/use-debounce";
import { BuildingCard } from "./building-card";
import { CreateBuildingModal } from "./create-building-modal";

export function BuildingsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const itemsPerPage = 6;

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch buildings using React Query
  const {
    data: buildingsResponse,
    isLoading,
    error,
    refetch,
  } = useBuildings({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearchTerm || undefined,
  });

  // Delete building mutation
  const deleteBuilding = useDeleteBuilding();

  // Extract data from response
  const buildings = buildingsResponse?.data?.buildings || [];
  const totalCount = buildingsResponse?.data?.pagination?.total || 0;
  const totalPages = buildingsResponse?.data?.pagination?.totalPages || 0;

  const handleBuildingAction = async (
    actionType: string,
    buildingId: string,
    buildingName: string
  ) => {
    console.log(
      `Action: ${actionType} for building ${buildingName} (ID: ${buildingId})`
    );

    switch (actionType) {
      case "view":
        // Navigate to building details
        window.location.href = `/dashboard/admin/buildings/${buildingId}`;
        break;
      case "edit":
        // Open edit modal
        toast({
          title: "În dezvoltare",
          description:
            "Funcționalitatea de editare va fi disponibilă în curând.",
        });
        break;
      case "delete":
        // Show confirmation and delete
        if (
          confirm(`Ești sigur că vrei să ștergi clădirea "${buildingName}"?`)
        ) {
          await handleDeleteBuilding(buildingId);
        }
        break;
      case "apartments":
        // Navigate to apartments management
        window.location.href = `/dashboard/admin/buildings/${buildingId}/apartments`;
        break;
      default:
        break;
    }
  };

  const handleDeleteBuilding = async (buildingId: string) => {
    try {
      await deleteBuilding.mutateAsync(buildingId);
      // Success toast is handled by the mutation hook
    } catch (error) {
      // Error toast is handled by the mutation hook
      console.error("Error deleting building:", error);
    }
  };

  const handleRetry = () => {
    refetch();
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Managementul Clădirilor
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administrează clădirile din sistem
            </p>
          </div>
          <CreateBuildingModal onSuccess={() => refetch()} />
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Caută clădiri..." disabled className="pl-10" />
        </div>

        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              className="animate-pulse transition-all duration-300 hover:shadow-lg border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 dark:shadow-gray-900/20"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Managementul Clădirilor
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administrează clădirile din sistem
            </p>
          </div>
          <CreateBuildingModal onSuccess={() => refetch()} />
        </div>

        {/* Error state */}
        <Card className="p-8 text-center transition-all duration-300 hover:shadow-lg border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 dark:shadow-gray-900/20">
          <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Eroare la încărcarea clădirilor
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Nu s-au putut încărca clădirile. Te rugăm să încerci din nou.
          </p>
          <Button onClick={handleRetry} variant="outline">
            Încearcă din nou
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Managementul Clădirilor
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administrează clădirile din sistem
          </p>
        </div>
        <CreateBuildingModal onSuccess={() => refetch()} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="transition-all duration-300 hover:shadow-lg border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 dark:shadow-gray-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Clădiri
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 hover:shadow-lg border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 dark:shadow-gray-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Apartamente
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {buildings.reduce(
                    (sum, building) => sum + building._count.apartments,
                    0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Caută clădiri..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Buildings Grid */}
      {buildings.length === 0 ? (
        <Card className="p-8 text-center transition-all duration-300 hover:shadow-lg border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 dark:shadow-gray-900/20">
          <Building2 className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm ? "Nicio clădire găsită" : "Nicio clădire"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm
              ? "Încearcă să modifici termenii de căutare."
              : "Începe prin a adăuga prima clădire."}
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buildings.map((building) => (
              <BuildingCard
                key={building.id}
                building={building}
                onAction={(actionType) =>
                  handleBuildingAction(actionType, building.id, building.name)
                }
                isDeleting={deleteBuilding.isPending}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Pagina {currentPage} din {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages || isLoading}
              >
                Următor
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
