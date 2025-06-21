"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  useVerifyEmail,
  isValidationError,
  getValidationErrors,
} from "@/hooks/api/use-auth";
import { toast } from "sonner";

type VerificationState = "idle" | "success" | "error" | "already-verified";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<VerificationState>("idle");
  const [userEmail, setUserEmail] = useState<string>("");

  const verifyEmail = useVerifyEmail({
    onSuccess: (data) => {
      if (data.data?.user) {
        setUserEmail(data.data.user.email);
        // Check if user was already verified
        if (data.message.includes("deja verificat")) {
          setState("already-verified");
        } else {
          setState("success");
        }
      } else {
        setState("success");
      }
      toast.success(data.message);
    },
    onError: (error) => {
      setState("error");
      if (isValidationError(error)) {
        const validationErrors = getValidationErrors(error);
        const errorMessage =
          Object.values(validationErrors)[0] || "Token invalid";
        toast.error(errorMessage);
      } else {
        const errorMessage =
          error.response?.data?.error ||
          "A apărut o eroare la verificarea email-ului";
        toast.error(errorMessage);
      }
    },
  });

  useEffect(() => {
    if (!token) {
      setState("error");
      toast.error("Token de verificare lipsește");
      return;
    }

    // Automatically trigger verification when component mounts
    verifyEmail.mutate(token);
  }, [token]);

  const getIcon = () => {
    if (verifyEmail.isPending) {
      return <LoadingSpinner className="h-12 w-12" />;
    }

    switch (state) {
      case "success":
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case "already-verified":
        return <CheckCircle className="h-12 w-12 text-blue-500" />;
      case "error":
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <AlertCircle className="h-12 w-12 text-yellow-500" />;
    }
  };

  const getCardTitle = () => {
    if (verifyEmail.isPending) {
      return "Se verifică email-ul...";
    }

    switch (state) {
      case "success":
        return "Email verificat cu succes!";
      case "already-verified":
        return "Cont deja verificat";
      case "error":
        return "Eroare la verificare";
      default:
        return "Verificare email";
    }
  };

  const getCardDescription = () => {
    if (verifyEmail.isPending) {
      return "Vă rugăm să așteptați în timp ce verificăm contul dvs.";
    }

    switch (state) {
      case "success":
        return "Contul dvs. a fost verificat cu succes. Acum vă puteți conecta.";
      case "already-verified":
        return "Contul dvs. era deja verificat. Vă puteți conecta oricând.";
      case "error":
        return "A apărut o problemă la verificarea contului dvs.";
      default:
        return "";
    }
  };

  const handleRetry = () => {
    if (token) {
      verifyEmail.mutate(token);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <Card className="backdrop-blur-md bg-white/20 border-white/10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">{getIcon()}</div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {getCardTitle()}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              {getCardDescription()}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {userEmail && (
            <div className="text-center text-sm text-muted-foreground">
              Email: <span className="font-medium">{userEmail}</span>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            {(state === "success" || state === "already-verified") && (
              <Button asChild borderRadius="full" className="w-full">
                <Link href="/auth/signin">Conectare</Link>
              </Button>
            )}

            {state === "error" && (
              <div className="space-y-2">
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="w-full"
                  disabled={verifyEmail.isPending}
                >
                  {verifyEmail.isPending
                    ? "Se încearcă din nou..."
                    : "Încearcă din nou"}
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/auth/register">Înapoi la înregistrare</Link>
                </Button>
              </div>
            )}

            <Button asChild variant="ghost" className="w-full">
              <Link href="/">Înapoi la pagina principală</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help text */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Probleme cu verificarea?{" "}
          <Link
            href="/contact"
            className="text-primary hover:underline font-medium"
          >
            Contactați suportul
          </Link>
        </p>
      </div>
    </div>
  );
}

function VerifyEmailFallback() {
  return (
    <div className="w-full max-w-md space-y-6">
      <Card className="backdrop-blur-md bg-white/20 border-white/10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <LoadingSpinner className="h-12 w-12" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Se încarcă...</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Vă rugăm să așteptați în timp ce pregătim verificarea.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <BackgroundGradient className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={<VerifyEmailFallback />}>
        <VerifyEmailContent />
      </Suspense>
    </BackgroundGradient>
  );
}
