import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import type { SafeUser } from "@/types/auth";

type ApartmentsCardProps = {
  user: SafeUser;
};

export function ApartmentsCard({ user }: ApartmentsCardProps) {
  // Only show for owners with apartments
  if (
    !user.owner ||
    !user.owner.apartments ||
    user.owner.apartments.length === 0
  ) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Apartamentele Mele
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {user.owner.apartments.map((apartment, index) => (
            <div
              key={apartment.id || index}
              className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <p className="text-sm font-medium">
                Apartament {apartment.number || `#${index + 1}`}
              </p>
              {apartment.building && (
                <p className="text-xs text-muted-foreground">
                  {apartment.building.name}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
