import { StatCard } from "@/components/ui/stat-card";
import {
  Home,
  Building2,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { ICON_COLOR_MAPPINGS } from "@/lib/constants/icon-colors";

type ApartmentStatsProps = {
  apartmentNumber: string;
  floorDisplay: string;
  occupantCount: number;
  surface: number | null;
  isOccupied: boolean;
};

export function ApartmentStats({
  apartmentNumber,
  floorDisplay,
  occupantCount,
  surface,
  isOccupied,
}: ApartmentStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
      <StatCard
        title="Nr. Apartament"
        value={apartmentNumber}
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
        value={occupantCount.toString()}
        description={occupantCount === 1 ? "persoană" : "persoane"}
        icon={User}
        iconColor={ICON_COLOR_MAPPINGS.apartmentPage.occupants}
        trend={
          occupantCount > 0
            ? {
                value: occupantCount,
                label: occupantCount === 1 ? "persoană" : "persoane",
                type: "neutral" as const,
              }
            : undefined
        }
      />
      <StatCard
        title="Suprafața"
        value={surface ? `${surface} m²` : "N/A"}
        description="Aria locuibilă"
        icon={MapPin}
        iconColor={ICON_COLOR_MAPPINGS.apartmentPage.surface}
      />
      <div className="col-span-2 sm:col-span-1">
        <StatCard
          title="Status"
          value={isOccupied ? "Ocupat" : "Liber"}
          description="Starea actuală"
          icon={isOccupied ? CheckCircle2 : XCircle}
          iconColor={
            isOccupied
              ? ICON_COLOR_MAPPINGS.apartmentPage.status.occupied
              : ICON_COLOR_MAPPINGS.apartmentPage.status.vacant
          }
          trend={
            isOccupied
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
  );
}
