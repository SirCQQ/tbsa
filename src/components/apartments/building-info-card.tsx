import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Calendar } from "lucide-react";
import { ICON_COLOR_MAPPINGS } from "@/lib/constants/icon-colors";

type BuildingInfoCardProps = {
  building: {
    id: string;
    name: string;
    code: string;
    address: string;
    floors: number;
    readingDay: number;
  };
  orgId: string;
  onNavigateToBuilding: () => void;
};

export function BuildingInfoCard({
  building,
  onNavigateToBuilding,
}: BuildingInfoCardProps) {
  return (
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
              <span className="text-xs sm:text-sm">{building.address}</span>
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
              onClick={onNavigateToBuilding}
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
  );
}
