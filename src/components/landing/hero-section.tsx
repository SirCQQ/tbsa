import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, DropletIcon, Users, TrendingUp } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-background dark:via-background dark:to-blue-900 py-20 sm:py-32">
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.1))]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Gestionează{" "}
            <span className="text-blue-600 dark:text-blue-400">asociația</span>{" "}
            de apartamente cu ușurință
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            TBSA simplifică administrarea clădirilor rezidențiale prin
            gestionarea automată a citirilor de apă, raportare transparentă și
            comunicare eficientă între administratori și proprietari.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg" className="px-8">
              <Link href="/register">Începe acum</Link>
            </Button>

            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Conectează-te</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mx-auto mt-20 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Gestionare Clădiri
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Administrează multiple clădiri dintr-un singur dashboard
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <DropletIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Citiri Apă
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Colectare și validare automată a citirilor lunare
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Colaborare
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Comunicare eficientă între administratori și proprietari
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Raportare
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Statistici detaliate și istorice de consum
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
