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
import { Droplets, Edit, Settings, AlertCircle } from "lucide-react";
import { PermissionGuardOr } from "@/components/auth/permission-guard";
import { ActionsEnum, ResourcesEnum, type WaterMeter } from "@prisma/client";
import { ICON_COLOR_MAPPINGS } from "@/lib/constants/icon-colors";

type WaterMeterWithReadings = WaterMeter & {
  _count: { waterReadings: number };
  latestReading:
    | {
        value: number;
        readingDate: Date;
        isApproved: boolean;
      }
    | undefined;
};

type WaterMetersCardProps = {
  waterMeters: WaterMeterWithReadings[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onAddWaterMeter: () => void;
  onEditWaterMeter: (meter: WaterMeter) => void;
};

export function WaterMetersCard({
  waterMeters,
  isLoading,
  error,
  onAddWaterMeter,
  onEditWaterMeter,
}: WaterMetersCardProps) {
  return (
    <Card className="backdrop-blur-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Droplets
                className={`h-5 w-5 ${ICON_COLOR_MAPPINGS.apartmentPage.water}`}
              />
              Contoare Apă
            </CardTitle>
            <CardDescription className="text-sm">
              Contoarele de apă asociate acestui apartament
            </CardDescription>
          </div>

          <PermissionGuardOr
            permissions={[`${ResourcesEnum.APARTMENTS}:${ActionsEnum.UPDATE}`]}
          >
            <Button
              size="sm"
              onClick={onAddWaterMeter}
              borderRadius="full"
              className="w-full sm:w-auto"
            >
              <Droplets className="h-4 w-4 mr-2" />
              Adaugă Contor
            </Button>
          </PermissionGuardOr>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              Nu s-au putut încărca contoarele de apă pentru acest apartament.
            </AlertDescription>
          </Alert>
        ) : !waterMeters || waterMeters.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              Nu există contoare de apă configurate pentru acest apartament.
              Apăsați pe "Adaugă Contor" pentru a adăuga primul contor.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {waterMeters.map((meter) => (
              <div
                key={meter.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">
                      {meter.serialNumber}
                    </span>
                    {meter.location && (
                      <span className="text-sm font-medium text-blue-600">
                        📍 {meter.location}
                      </span>
                    )}
                    <Badge
                      variant={meter.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {meter.isActive ? "Activ" : "Inactiv"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {meter.brand && meter.model && (
                      <span>
                        🔧 {meter.brand} {meter.model}
                      </span>
                    )}
                    <span>📊 {meter._count.waterReadings} citiri</span>
                  </div>
                  {meter.latestReading && (
                    <div className="text-xs text-muted-foreground">
                      Ultima citire:{" "}
                      <span className="font-medium">
                        {meter.latestReading.value} m³
                      </span>
                      {" • "}
                      {new Date(
                        meter.latestReading.readingDate
                      ).toLocaleDateString("ro-RO")}
                      {meter.latestReading.isApproved ? (
                        <Badge className="ml-2 text-xs bg-green-100 text-green-800">
                          Aprobată
                        </Badge>
                      ) : (
                        <Badge className="ml-2 text-xs bg-yellow-100 text-yellow-800">
                          În așteptare
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <PermissionGuardOr
                    permissions={[
                      `${ResourcesEnum.APARTMENTS}:${ActionsEnum.UPDATE}`,
                    ]}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditWaterMeter(meter)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </PermissionGuardOr>
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
