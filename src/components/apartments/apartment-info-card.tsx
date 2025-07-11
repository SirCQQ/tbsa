import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, User, CheckCircle2, XCircle } from "lucide-react";
import { ICON_COLOR_MAPPINGS } from "@/lib/constants/icon-colors";

type ApartmentInfoCardProps = {
  apartment: {
    number: string;
    floor: number;
    surface: number | null;
    occupantCount: number;
    isOccupied: boolean;
    description?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  floorDisplay: string;
};

export function ApartmentInfoCard({
  apartment,
  floorDisplay,
}: ApartmentInfoCardProps) {
  return (
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
                  {apartment.occupantCount === 1 ? "persoană" : "persoane"}
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
                {new Date(apartment.createdAt).toLocaleDateString("ro-RO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                ACTUALIZAT LA
              </h4>
              <p className="text-xs sm:text-sm">
                {new Date(apartment.updatedAt).toLocaleDateString("ro-RO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
