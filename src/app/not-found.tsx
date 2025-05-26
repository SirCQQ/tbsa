"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Building2 } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <Building2 className="h-16 w-16 text-blue-600" />
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  !
                </div>
              </div>
            </div>

            {/* Error Code */}
            <div>
              <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Pagina nu a fost găsită
              </h2>
              <p className="text-gray-600 text-sm">
                Ne pare rău, dar pagina pe care o căutați nu există sau a fost
                mutată.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Înapoi la pagina principală
                </Link>
              </Button>

              <Button
                variant="outline"
                onClick={handleGoBack}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Înapoi la pagina anterioară
              </Button>
            </div>

            {/* Additional Help */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">
                Dacă problema persistă, contactați administratorul:
              </p>
              <Link
                href="mailto:admin@tbsa.ro"
                className="text-blue-600 hover:text-blue-800 text-xs underline"
              >
                admin@tbsa.ro
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
