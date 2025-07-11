import { Button } from "@/components/ui/button";
import { PermissionGuardOr } from "@/components/auth/permission-guard";
import { Edit, User, Droplets } from "lucide-react";
import { ActionsEnum, ResourcesEnum } from "@prisma/client";

type ApartmentQuickActionsProps = {
  onEditApartment: () => void;
  onAddWaterMeter: () => void;
};

export function ApartmentQuickActions({
  onEditApartment,
  onAddWaterMeter,
}: ApartmentQuickActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-center gap-3">
      <PermissionGuardOr
        permissions={[`${ResourcesEnum.APARTMENTS}:${ActionsEnum.UPDATE}`]}
      >
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={onEditApartment}
        >
          <Edit className="h-4 w-4 mr-2" />
          Editează Apartament
        </Button>
      </PermissionGuardOr>
      <PermissionGuardOr
        permissions={[`${ResourcesEnum.APARTMENTS}:${ActionsEnum.UPDATE}`]}
      >
        <Button variant="outline" className="w-full sm:w-auto">
          <User className="h-4 w-4 mr-2" />
          Gestionează Rezidenți
        </Button>
      </PermissionGuardOr>
      <PermissionGuardOr
        permissions={[`${ResourcesEnum.APARTMENTS}:${ActionsEnum.UPDATE}`]}
      >
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={onAddWaterMeter}
        >
          <Droplets className="h-4 w-4 mr-2" />
          Adaugă Contor Apă
        </Button>
      </PermissionGuardOr>
    </div>
  );
}
