import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="text-center p-8">
          {/* 404 Number */}
          <div className="text-8xl font-bold text-blue-600 mb-4">404</div>

          {/* Error Message */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
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
            <Button asChild className="w-full">
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
    </div>
  );
}
