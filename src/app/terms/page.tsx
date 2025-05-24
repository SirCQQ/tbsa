import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Users,
  AlertTriangle,
  CreditCard,
  ShieldCheck,
  Gavel,
} from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      id: "acceptarea-termenilor",
      title: "1. Acceptarea termenilor",
      icon: FileText,
      content: [
        "Prin accesarea și utilizarea platformei TBSA, declarați că ați citit, înțeles și acceptat în totalitate acești Termeni și Condiții.",
        "Dacă nu sunteți de acord cu acești termeni, vă rugăm să nu utilizați serviciile noastre.",
        "Ne rezervăm dreptul de a modifica acești termeni în orice moment, cu notificare prealabilă către utilizatori.",
      ],
    },
    {
      id: "descrierea-serviciului",
      title: "2. Descrierea serviciului",
      icon: Users,
      content: [
        "TBSA este o platformă digitală pentru gestionarea asociațiilor de apartamente care oferă:",
        "• Gestionarea citirilor de consum de apă",
        "• Administrarea datelor despre clădiri și apartamente",
        "• Facilități de comunicare între administratori și proprietari",
        "• Generarea de rapoarte și statistici",
        "• Sistem de notificări și reminders",
        "Serviciul este destinat administratorilor de asociații și proprietarilor de apartamente din România.",
      ],
    },
    {
      id: "contul-utilizatorului",
      title: "3. Contul utilizatorului",
      icon: ShieldCheck,
      content: [
        "Pentru utilizarea serviciilor TBSA, este necesar să vă creați un cont de utilizator.",
        "Sunteți responsabil pentru:",
        "• Menținerea confidențialității parolei contului",
        "• Toate activitățile care au loc sub contul dvs.",
        "• Notificarea imediată în caz de utilizare neautorizată",
        "• Furnizarea de informații corecte și actualizate",
        "Ne rezervăm dreptul de a suspenda sau închide conturile care încalcă acești termeni.",
      ],
    },
    {
      id: "utilizarea-acceptabila",
      title: "4. Utilizarea acceptabilă",
      icon: AlertTriangle,
      content: [
        "Vă angajați să utilizați platforma TBSA doar în scopuri legale și în conformitate cu acești termeni.",
        "Este interzis să:",
        "• Încărcați conținut ilegal, amenințător sau defăimător",
        "• Interferați cu funcționarea normală a sistemului",
        "• Încercați să accesați conturi ale altor utilizatori",
        "• Utilizați platforma pentru activități comerciale neautorizate",
        "• Distribuiți malware sau conținut dăunător",
      ],
    },
    {
      id: "taxe-si-plati",
      title: "5. Taxe și plăți",
      icon: CreditCard,
      content: [
        "TBSA oferă o perioadă de încercare gratuită pentru noii utilizatori.",
        "După perioada de încercare, se aplică următoarele condiții:",
        "• Tarifele sunt afișate clar pe site și în cont",
        "• Plățile se efectuează lunar sau anual, în funcție de planul ales",
        "• Toate prețurile includ TVA conform legislației românești",
        "• Rambursările sunt disponibile în conformitate cu politica noastră de rambursare",
        "• Ne rezervăm dreptul de a modifica tarifele cu o notificare de 30 de zile",
      ],
    },
    {
      id: "limitarea-raspunderii",
      title: "6. Limitarea răspunderii",
      icon: Gavel,
      content: [
        'TBSA furnizează serviciile "ca atare" și nu oferă garanții explicite sau implicite.',
        "Nu suntem răspunzători pentru:",
        "• Pierderi de date datorate unor circumstanțe în afara controlului nostru",
        "• Întreruperi temporare ale serviciului pentru mentenanță",
        "• Daune indirecte sau consecințe ale utilizării platformei",
        "• Acțiunile sau omisiunile utilizatorilor terți",
        "Răspunderea noastră totală este limitată la suma plătită pentru serviciile TBSA în ultimele 12 luni.",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-16">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="secondary" className="mb-4">
                <FileText className="h-4 w-4 mr-2" />
                Documentație legală
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                Termeni și{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  Condiții
                </span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                Acești termeni reglementează utilizarea platformei TBSA și
                stabilesc drepturile și obligațiile pentru toți utilizatorii.
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

        {/* Content Sections */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-4xl space-y-8">
              {sections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <Card key={section.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                          <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-xl">
                          {section.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {section.content.map((paragraph, idx) => (
                          <p
                            key={idx}
                            className="text-gray-700 dark:text-gray-300 leading-relaxed"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Additional Sections */}
              <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">
                      7. Modificări ale termenilor
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Ne rezervăm dreptul de a modifica acești Termeni și
                      Condiții în orice moment. Modificările vor fi comunicate
                      prin:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      <li>Email către adresa asociată contului dvs.</li>
                      <li>
                        Notificare în platformă la următoarea autentificare
                      </li>
                      <li>
                        Actualizarea datei de modificare pe această pagină
                      </li>
                    </ul>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Continuarea utilizării serviciilor după modificări
                      constituie acceptarea noilor termeni.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                      <Gavel className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">
                      8. Legea aplicabilă și jurisdicția
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Acești Termeni și Condiții sunt guvernați de legea română.
                      Orice dispută va fi rezolvată de instanțele competente din
                      România.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Pentru întrebări despre acești termeni, ne puteți contacta
                      la:
                    </p>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        legal@tbsa.ro
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Departamentul Legal TBSA
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
