import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, Target, Heart, Award, Zap } from "lucide-react";

export function AboutSection() {
  const values = [
    {
      icon: Target,
      title: "Transparență",
      description:
        "Oferim transparență completă în toate procesele de administrare și raportare.",
      color: "bg-blue-500",
    },
    {
      icon: Heart,
      title: "Comunitate",
      description:
        "Construim comunități mai unite prin comunicare eficientă și colaborare.",
      color: "bg-red-500",
    },
    {
      icon: Zap,
      title: "Inovație",
      description:
        "Adoptăm tehnologii moderne pentru a simplifica procesele complexe.",
      color: "bg-yellow-500",
    },
    {
      icon: Award,
      title: "Calitate",
      description:
        "Ne concentrăm pe calitatea serviciilor și satisfacția utilizatorilor.",
      color: "bg-green-500",
    },
  ];

  const stats = [
    { number: "50+", label: "Asociații active" },
    { number: "2000+", label: "Apartamente gestionate" },
    { number: "99.5%", label: "Uptime garantat" },
    { number: "24/7", label: "Suport tehnic" },
  ];

  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Despre noi
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Cine suntem și ce{" "}
            <span className="text-blue-600 dark:text-blue-400">
              ne motivează
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            TBSA a fost creată din nevoia de a moderniza și simplifica
            administrarea asociațiilor de apartamente din România.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Povestea noastră
            </h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p className="leading-relaxed">
                Totul a început dintr-o frustrare comună: procesele birocratice
                complexe și comunicarea deficitară în asociațiile de
                apartamente. Ca proprietari de apartamente, am experimentat
                personal dificultățile administrării tradiționale.
              </p>
              <p className="leading-relaxed">
                Am văzut administratori care jonglau cu foi de calcul
                nesfârșite, proprietari care nu știau niciodată când să trimită
                citirile, și întâlniri lungi pentru probleme care puteau fi
                rezolvate digital în câteva minute.
              </p>
              <p className="leading-relaxed">
                Astfel s-a născut TBSA - o platformă care pune tehnologia în
                slujba comunității, transformând administrarea în ceva simplu,
                transparent și eficient.
              </p>
            </div>
            <Button className="mt-6">
              <Users className="h-4 w-4 mr-2" />
              Alătură-te comunității
            </Button>
          </div>

          <div className="relative">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Misiunea TBSA
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Viziunea noastră pentru viitor
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Să democratizăm accesul la tehnologie pentru toate asociațiile
                  de apartamente din România, indiferent de mărime sau buget,
                  oferind instrumente profesionale într-o interfață intuitivă
                  care pune comunitatea pe primul loc.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Valorile noastre
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Principiile care ne ghidează în dezvoltarea unei platforme care
              pune utilizatorii pe primul loc
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-shadow duration-300"
                >
                  <CardContent className="p-6">
                    <div
                      className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${value.color} mb-4`}
                    >
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {value.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Impactul nostru
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Cifrele care demonstrează încrederea comunității în TBSA
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
