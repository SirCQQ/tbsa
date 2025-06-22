"use client";

import { useBuildings } from "@/hooks/api/use-buildings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  Home,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import type { BuildingWithOrganization } from "@/lib/api/buildings";

type OrgBuildingsListProps = {
  organizationId: string;
  onAddBuilding?: () => void;
  onEditBuilding?: (building: BuildingWithOrganization) => void;
  onDeleteBuilding?: (building: BuildingWithOrganization) => void;
  onViewBuilding?: (building: BuildingWithOrganization) => void;
};

export function OrgBuildingsList({
  organizationId: _organizationId,
  onAddBuilding,
  onEditBuilding,
  onDeleteBuilding,
  onViewBuilding,
}: OrgBuildingsListProps) {
  const { data: buildings, isLoading, error } = useBuildings();

  if (isLoading) {
    return <BuildingsListSkeleton />;
  }

  if (error) {
    return (
      <Card className="backdrop-blur-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <Typography variant="h3" className="mb-2">
            Eroare la încărcarea clădirilor
          </Typography>
          <Typography
            variant="p"
            className="text-muted-foreground text-center mb-4"
          >
            Nu am putut încărca lista clădirilor. Vă rugăm să încercați din nou.
          </Typography>
          <Button onClick={() => window.location.reload()} borderRadius="full">
            Încearcă din nou
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!buildings || buildings.length === 0) {
    return (
      <Card className="backdrop-blur-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <Typography variant="h3" className="mb-2">
            Nicio clădire găsită
          </Typography>
          <Typography
            variant="p"
            className="text-muted-foreground text-center mb-4"
          >
            Nu aveți încă clădiri înregistrate în organizația dumneavoastră.
            Adăugați prima clădire pentru a începe.
          </Typography>
          {onAddBuilding && (
            <Button onClick={onAddBuilding} borderRadius="full">
              <Building2 className="h-4 w-4 mr-2" />
              Adaugă Prima Clădire
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2" className="mb-2">
            Clădirile Organizației
          </Typography>
          <Typography variant="p" className="text-muted-foreground">
            {buildings.length} {buildings.length === 1 ? "clădire" : "clădiri"}{" "}
            înregistrate
          </Typography>
        </div>
        {onAddBuilding && (
          <Button onClick={onAddBuilding} borderRadius="full">
            <Building2 className="h-4 w-4 mr-2" />
            Adaugă Clădire
          </Button>
        )}
      </div>

      {/* Buildings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buildings.map((building) => (
          <BuildingCard
            key={building.id}
            building={building}
            onEdit={onEditBuilding}
            onDelete={onDeleteBuilding}
            onView={onViewBuilding}
          />
        ))}
      </div>
    </div>
  );
}

type BuildingCardProps = {
  building: BuildingWithOrganization;
  onEdit?: (building: BuildingWithOrganization) => void;
  onDelete?: (building: BuildingWithOrganization) => void;
  onView?: (building: BuildingWithOrganization) => void;
};

function BuildingCard({
  building,
  onEdit,
  onDelete,
  onView,
}: BuildingCardProps) {
  const getBuildingTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      RESIDENTIAL: "Rezidențial",
      COMMERCIAL: "Comercial",
      MIXED: "Mixt",
      OFFICE: "Birouri",
      INDUSTRIAL: "Industrial",
    };
    return typeLabels[type] || type;
  };

  const getBuildingTypeVariant = (type: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      RESIDENTIAL: "default",
      COMMERCIAL: "secondary",
      MIXED: "outline",
      OFFICE: "secondary",
      INDUSTRIAL: "destructive",
    };
    return variants[type] || "outline";
  };

  return (
    <Card className="backdrop-blur-md hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {building.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant={getBuildingTypeVariant(building.type)}
                className="text-xs"
              >
                {getBuildingTypeLabel(building.type)}
              </Badge>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {building.code}
              </code>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Opțiuni clădire</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(building)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Vezi Detalii
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(building)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editează
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(building)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Șterge
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Address */}
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="text-muted-foreground">{building.address}</span>
        </div>

        {/* Building Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">{building.floors}</div>
              <div className="text-xs text-muted-foreground">
                {building.floors === 1 ? "Etaj" : "Etaje"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">
                {building.totalApartments}
              </div>
              <div className="text-xs text-muted-foreground">
                {building.totalApartments === 1 ? "Apartament" : "Apartamente"}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {building.description && (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {building.description}
          </div>
        )}

        {/* Reading Day */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Zi citire: {building.readingDay} a fiecărei luni
          </span>
        </div>

        {/* Created Date */}
        <div className="text-xs text-muted-foreground">
          Adăugată pe{" "}
          {format(new Date(building.createdAt), "dd MMMM yyyy", {
            locale: ro,
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function BuildingsListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Buildings Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="backdrop-blur-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-40" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
