import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, AlertCircle } from "lucide-react";

type ResidentsCardProps = {
  isOccupied: boolean;
};

export function ResidentsCard({ isOccupied }: ResidentsCardProps) {
  return (
    <Card className="backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <User className="h-5 w-5 text-indigo-500" />
          Rezidenți
        </CardTitle>
        <CardDescription className="text-sm">
          Persoanele care locuiesc în acest apartament
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isOccupied ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              Funcționalitatea de gestionare a rezidenților va fi implementată
              în curând. Apartamentul este marcat ca ocupat.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              Acest apartament este momentan liber. Nu există rezidenți
              înregistrați.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
