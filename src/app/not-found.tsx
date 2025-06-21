import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Header } from "@/components/landing/header";
import { Typography } from "@/components/ui/typography";

export default function NotFound() {
  return (
    <>
      <Header />
      <BackgroundGradient className="flex h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            {/* 404 Number */}
            <Typography className="text-8xl font-bold  mb-4" gradient="ocean">
              404
            </Typography>

            {/* Error Message */}
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Pagina nu a fost găsită
            </h1>

            <p className="text-gray-600 mb-8">
              Ne pare rău, dar pagina pe care o căutați nu există sau a fost
              mutată.
            </p>

            {/* Search Icon */}
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-blue-100 rounded-full">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button asChild variant="gradient-cyan" className="w-full">
                <Link href="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Înapoi la Dashboard
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Pagina Principală
                </Link>
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-sm text-gray-500 mt-6">
              Dacă problema persistă, vă rugăm să contactați administratorul.
            </p>
          </CardContent>
        </Card>
      </BackgroundGradient>
    </>
  );
}
