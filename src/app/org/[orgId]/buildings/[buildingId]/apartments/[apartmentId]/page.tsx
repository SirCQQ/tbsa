"use client";

import { useState } from "react";
import { Page } from "@/components/ui/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useApartment } from "@/hooks/api/use-apartments";
import { useBuilding } from "@/hooks/api/use-buildings";
import { useWaterMetersByApartment } from "@/hooks/api/use-water-meters";
import { type WaterMeter } from "@prisma/client";
import {
  ApartmentHeader,
  ApartmentStats,
  ApartmentInfoCard,
  BuildingInfoCard,
  LatestWaterReadingCard,
  WaterMetersCard,
  ResidentsCard,
  ApartmentQuickActions,
  EditApartmentModal,
  AddWaterMeterModal,
  EditWaterMeterModal,
} from "@/components/apartments";

export default function ApartmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  const buildingId = params.buildingId as string;
  const apartmentId = params.apartmentId as string;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddWaterMeterModalOpen, setIsAddWaterMeterModalOpen] =
    useState(false);
  const [editingWaterMeter, setEditingWaterMeter] = useState<WaterMeter | null>(
    null
  );

  const {
    data: apartment,
    isLoading: apartmentLoading,
    error: apartmentError,
  } = useApartment(apartmentId);
  const { data: building, isLoading: buildingLoading } = useBuilding(
    buildingId,
    orgId
  );
  const {
    data: waterMeters,
    isLoading: waterMetersLoading,
    error: waterMetersError,
  } = useWaterMetersByApartment(apartmentId);

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
        <ApartmentHeader
          apartmentNumber={apartment.number}
          buildingName={building?.name}
          floorDisplay={floorDisplay}
          isOccupied={apartment.isOccupied}
          onEdit={() => setIsEditModalOpen(true)}
        />

        {/* Stats Overview - Responsive grid */}
        <ApartmentStats
          apartmentNumber={apartment.number}
          floorDisplay={floorDisplay}
          occupantCount={apartment.occupantCount}
          surface={apartment.surface || null}
          isOccupied={apartment.isOccupied}
        />

        {/* Apartment Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ApartmentInfoCard
            apartment={{
              ...apartment,
              surface: apartment.surface || null,
              createdAt: new Date(apartment.createdAt),
              updatedAt: new Date(apartment.updatedAt),
            }}
            floorDisplay={floorDisplay}
          />
          {building && (
            <BuildingInfoCard
              building={building}
              orgId={orgId}
              onNavigateToBuilding={() =>
                router.push(`/org/${orgId}/buildings/${buildingId}`)
              }
            />
          )}
        </div>

        {/* Latest Water Reading Section */}
        {waterMeters &&
          waterMeters.waterMeters &&
          waterMeters.waterMeters.length > 0 && (
            <LatestWaterReadingCard waterMeters={waterMeters.waterMeters} />
          )}

        {/* Residents Section (Placeholder) */}
        <ResidentsCard isOccupied={apartment.isOccupied} />

        {/* Water Meters Section */}
        <WaterMetersCard
          waterMeters={waterMeters?.waterMeters}
          isLoading={waterMetersLoading}
          error={waterMetersError}
          onAddWaterMeter={() => setIsAddWaterMeterModalOpen(true)}
          onEditWaterMeter={setEditingWaterMeter}
        />

        {/* Quick Actions - Mobile optimized */}
        <ApartmentQuickActions
          onEditApartment={() => setIsEditModalOpen(true)}
          onAddWaterMeter={() => setIsAddWaterMeterModalOpen(true)}
        />

        {/* Edit Apartment Modal */}
        {apartment && building && (
          <EditApartmentModal
            apartment={apartment}
            buildingMaxFloors={building.floors}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
          />
        )}

        {/* Add Water Meter Modal */}
        {apartment && (
          <AddWaterMeterModal
            apartment={{
              ...apartment,
              _count: { waterMeters: waterMeters?.waterMeters?.length || 0 },
            }}
            open={isAddWaterMeterModalOpen}
            onOpenChange={setIsAddWaterMeterModalOpen}
          />
        )}

        {/* Edit Water Meter Modal */}
        {editingWaterMeter && (
          <EditWaterMeterModal
            waterMeter={editingWaterMeter}
            open={!!editingWaterMeter}
            onOpenChange={(open) => {
              if (!open) {
                setEditingWaterMeter(null);
              }
            }}
          />
        )}
      </div>
    </Page>
  );
}
