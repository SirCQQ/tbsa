import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import type { UserRegistrationResponse } from "@/lib/api/auth";

type SuccessStepProps = {
  registrationData: UserRegistrationResponse;
};

export function SuccessStep({ registrationData }: SuccessStepProps) {
  const router = useRouter();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <CardTitle className="text-2xl font-bold text-green-700">
          Înregistrare reușită!
        </CardTitle>
        <CardDescription className="text-lg">
          Contul dvs. a fost creat cu succes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Verificați email-ul:</strong> Am trimis un email de
            confirmare la <strong>{registrationData.data.user.email}</strong>.
            Faceți clic pe linkul din email pentru a-vă activa contul.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">
                Organizație
              </h4>
              <p className="font-medium">
                {registrationData.data.organization.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Cod: {registrationData.data.organization.code}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">
                Utilizator
              </h4>
              <p className="font-medium">
                {registrationData.data.user.firstName}{" "}
                {registrationData.data.user.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {registrationData.data.user.email}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => router.push("/auth/signin")}
            className="w-full"
            borderRadius="full"
          >
            Continuă spre autentificare
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full"
          >
            Înapoi la pagina principală
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
