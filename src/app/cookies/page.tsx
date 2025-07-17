import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Cookie,
  Settings,
  Shield,
  BarChart3,
  UserCheck,
  Trash2,
} from "lucide-react";
import { Page } from "@/components/ui/page";

export default function CookiesPage() {
  const cookieTypes = [
    {
      type: "Esențiale",
      icon: Shield,
      duration: "Sesiunea",
      purpose: "Funcționarea de bază a platformei",
      examples: [
        "Token de autentificare",
        "Preferințe de sesiune",
        "Securitate CSRF",
      ],
      canDisable: false,
      color: "bg-red-500",
    },
    {
      type: "Funcționale",
      icon: Settings,
      duration: "1 an",
      purpose: "Personalizarea experienței utilizatorului",
      examples: [
        "Tema preferată (dark/light)",
        "Limba selectată",
        "Setări layout",
      ],
      canDisable: true,
      color: "bg-blue-500",
    },
    {
      type: "Analitice",
      icon: BarChart3,
      duration: "2 ani",
      purpose: "Înțelegerea utilizării platformei",
      examples: ["Pagini vizitate", "Timp petrecut", "Sursa traficului"],
      canDisable: true,
      color: "bg-green-500",
    },
  ];

  return (
    <Page className="pb-0">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-16">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="secondary" className="mb-4">
                <Cookie className="h-4 w-4 mr-2" />
                Politica cookies
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                Politica de{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  Cookies
                </span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                Aflați cum folosim cookies-urile pentru a îmbunătăți experiența
                dvs. pe platforma TBSA și cum puteți controla preferințele.
              </p>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Ultima actualizare:{" "}
                {new Date().toLocaleDateString("ro-RO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </section>

        {/* What Are Cookies Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                      <Cookie className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <CardTitle className="text-2xl">
                      Ce sunt cookies-urile?
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Cookies-urile sunt mici fișiere de text stocate pe
                      dispozitivul dvs. atunci când vizitați un site web.
                      Acestea ne ajută să vă oferim o experiență personalizată
                      și să îmbunătățim funcționalitatea platformei TBSA.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Folosim cookies-uri pentru a vă recunoaște la vizitele
                      viitoare, a reține preferințele dvs. și a analiza modul în
                      care utilizați serviciile noastre.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Cookie Types Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Tipuri de cookies utilizate
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  TBSA folosește diferite tipuri de cookies, fiecare cu un scop
                  specific
                </p>
              </div>

              <div className="space-y-6">
                {cookieTypes.map((cookie, index) => {
                  const IconComponent = cookie.icon;
                  return (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-lg ${cookie.color}`}
                            >
                              <IconComponent className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-xl">
                                {cookie.type}
                              </CardTitle>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Durata: {cookie.duration}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              cookie.canDisable ? "secondary" : "destructive"
                            }
                          >
                            {cookie.canDisable ? "Opțional" : "Necesar"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-gray-700 dark:text-gray-300">
                            <strong>Scop:</strong> {cookie.purpose}
                          </p>
                          <div>
                            <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                              Exemple:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                              {cookie.examples.map((example, idx) => (
                                <li key={idx}>{example}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Cookie Control Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-4xl space-y-8">
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                      <UserCheck className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">
                      Controlul cookies-urilor
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Aveți control complet asupra cookies-urilor utilizate pe
                      platforma TBSA. Puteți gestiona preferințele în
                      următoarele moduri:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          În platformă
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Accesați setările de confidențialitate din contul dvs.
                        </p>
                        <Button size="sm" className="w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          Setări cookies
                        </Button>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          În browser
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Configurați setările din browserul dvs.
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Șterge cookies
                        </Button>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        <strong>Atenție:</strong> Dezactivarea cookies-urilor
                        esențiale poate afecta funcționarea platformei și vă
                        poate împiedica să vă autentificați sau să folosiți
                        anumite funcționalități.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Cookies de la terțe părți
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      În anumite situații, putem folosi servicii de la terțe
                      părți care pot seta propriile cookies. Acestea includ:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      <li>Servicii de analiză pentru înțelegerea traficului</li>
                      <li>Sisteme de plată securizate</li>
                      <li>Servicii de suport și chat</li>
                    </ul>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Aceste servicii au propriile politici de confidențialitate
                      și cookies, pe care vi le recomandăm să le consultați.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-xl">
                    Contact și întrebări
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Pentru întrebări despre utilizarea cookies-urilor pe
                    platforma TBSA, ne puteți contacta:
                  </p>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                      cookies@tbsa.ro
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      Echipa de Confidențialitate TBSA
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </Page>
  );
}
