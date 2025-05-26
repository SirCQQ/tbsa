import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function ProfileHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la Dashboard
          </Link>
        </Button>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Profilul Meu
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-2">
        Gestionează informațiile contului tău
      </p>
    </div>
  );
}
