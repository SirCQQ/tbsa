import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";

import { BackgroundGradient } from "@/components/ui/background-gradient";
import { LoginForm } from "@/components/auth/login-form";
import { Typography } from "@/components/ui/typography";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const metadata: Metadata = {
  title: "Conectează-te | TBSA",
  description:
    "Conectează-te la contul tău TBSA pentru a gestiona citirile de apă.",
};

function LoginPageContent() {
  return (
    <BackgroundGradient className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <Typography
              variant="h1"
              gradient="primary"
              className="text-3xl font-bold"
            >
              TBSA
            </Typography>
            <Typography variant="p" className="text-muted-foreground">
              Sistem de gestiune pentru asociații de proprietari
            </Typography>
          </div>

          {/* Login Form */}
          <LoginForm callbackUrl="/dashboard" />

          {/* Footer Links */}
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              Nu ai cont încă?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-primary hover:underline"
              >
                Înregistrează-te aici
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <Link href="/terms" className="hover:underline">
                Termeni și condiții
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:underline">
                Politica de confidențialitate
              </Link>
            </div>
          </div>
        </div>
      </div>
    </BackgroundGradient>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
