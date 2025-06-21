import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ErrorStepProps = {
  error?: string;
  onRetry: () => void;
};

export function ErrorStep({ error, onRetry }: ErrorStepProps) {
  const router = useRouter();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>
        <CardTitle className="text-2xl font-bold text-red-700">
          Eroare la înregistrare
        </CardTitle>
        <CardDescription>
          A apărut o problemă în timpul procesului de înregistrare
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error ||
              "A apărut o eroare neașteptată. Vă rugăm să încercați din nou."}
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-3">
          <Button onClick={onRetry} className="w-full" borderRadius="full">
            Încearcă din nou
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
