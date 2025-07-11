import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Droplets, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { WaterMeterListItem } from "@/services/water-meter.service";

type LatestWaterReadingCardProps = {
  waterMeters: WaterMeterListItem[];
};

export function LatestWaterReadingCard({
  waterMeters,
}: LatestWaterReadingCardProps) {
  // Find the most recent reading across all meters
  const allReadings = waterMeters
    .filter((meter) => meter.latestReading)
    .map((meter) => ({
      ...meter.latestReading!,
      meterSerialNumber: meter.serialNumber,
      meterLocation: meter.location,
    }))
    .sort(
      (a, b) =>
        new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime()
    );

  const latestReading = allReadings[0];

  return (
    <Card className="backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Droplets className="h-5 w-5 text-blue-500" />
          Ultima Citire Apă
        </CardTitle>
        <CardDescription className="text-sm">
          Cea mai recentă citire înregistrată pentru acest apartament
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!latestReading ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              Nu există citiri înregistrate pentru contoarele acestui
              apartament.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                  VALOARE CITIRE
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600">
                    {latestReading.value}
                  </span>
                  <span className="text-sm text-muted-foreground">m³</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                  DATA CITIRE
                </h4>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    {new Date(latestReading.readingDate).toLocaleDateString(
                      "ro-RO",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                  STATUS
                </h4>
                <Badge
                  variant={latestReading.isApproved ? "default" : "secondary"}
                  className={
                    latestReading.isApproved
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                  }
                >
                  {latestReading.isApproved ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Aprobată
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      În așteptare
                    </>
                  )}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                DETALII CONTOR
              </h4>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium">
                  {latestReading.meterSerialNumber}
                </span>
                {latestReading.meterLocation && (
                  <span className="text-blue-600">
                    📍 {latestReading.meterLocation}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
