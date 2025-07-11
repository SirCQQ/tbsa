import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import { PageNavigation } from "@/components/ui/page-navigation";
import { PermissionGuardOr } from "@/components/auth/permission-guard";
import { Edit, Settings, CheckCircle2, XCircle } from "lucide-react";
import { ActionsEnum, ResourcesEnum } from "@prisma/client";

type ApartmentHeaderProps = {
  apartmentNumber: string;
  buildingName?: string;
  floorDisplay: string;
  isOccupied: boolean;
  onEdit: () => void;
};

export function ApartmentHeader({
  apartmentNumber,
  buildingName,
  floorDisplay,
  isOccupied,
  onEdit,
}: ApartmentHeaderProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageNavigation
        title={`Apartament ${apartmentNumber}`}
        className="mb-4"
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Typography
            variant="h1"
            gradient="blue"
            className="text-2xl sm:text-3xl lg:text-4xl"
          >
            Apartament {apartmentNumber}
          </Typography>
          <Typography
            variant="p"
            className="text-muted-foreground text-sm sm:text-base"
          >
            {buildingName} • {floorDisplay}
          </Typography>
        </div>

        {/* Action Buttons - Stack on mobile */}
        <div className="flex flex-col sm:flex-row gap-2">
          <PermissionGuardOr
            permissions={[`${ResourcesEnum.APARTMENTS}:${ActionsEnum.UPDATE}`]}
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4 mr-2 text-blue-500" />
              <span className="sm:inline">Editează</span>
            </Button>
          </PermissionGuardOr>
          <PermissionGuardOr
            permissions={[`${ResourcesEnum.APARTMENTS}:${ActionsEnum.UPDATE}`]}
          >
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Settings className="h-4 w-4 mr-2 text-gray-500" />
              <span className="sm:inline">Setări</span>
            </Button>
          </PermissionGuardOr>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge
          variant={isOccupied ? "default" : "secondary"}
          className={
            isOccupied
              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100"
              : ""
          }
        >
          {isOccupied ? (
            <>
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Apartament Ocupat
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              Apartament Liber
            </>
          )}
        </Badge>
      </div>
    </div>
  );
}
