import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, UserCheck, Database, Mail } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      id: "introducere",
      title: "1. Introducere",
      icon: Shield,
      content: [
        'Platforma TBSA ("noi", "nostru", "compania") respectă confidențialitatea utilizatorilor și se angajează să protejeze datele personale în conformitate cu Regulamentul General privind Protecția Datelor (GDPR) și legislația românească aplicabilă.',
        "Această Politică de Confidențialitate explică cum colectăm, folosim, stocăm și protejăm informațiile dvs. personale atunci când utilizați platforma noastră de management pentru asociații de apartamente.",
      ],
    },
    {
      id: "date-colectate",
      title: "2. Datele pe care le colectăm",
      icon: Database,
      content: [
        "Colectăm următoarele categorii de date personale:",
        "• Informații de identificare: nume, prenume, adresă de email, număr de telefon",
        "• Informații de autentificare: parole criptate, tokeni de sesiune",
        "• Informații despre apartament: numărul apartamentului, etajul, numărul de camere",
        "• Citiri ale contoarelor: valori lunare ale consumului de apă",
        "• Date de utilizare: log-uri de acces, adrese IP, tipul de browser",
      ],
    },
    {
      id: "scopul-prelucarii",
      title: "3. Scopul prelucrării datelor",
      icon: UserCheck,
      content: [
        "Prelucrăm datele dvs. personale pentru următoarele scopuri:",
        "• Furnizarea serviciilor de management al asociației de apartamente",
        "• Gestionarea conturilor de utilizator și autentificarea",
        "• Colectarea și validarea citirilor de consum",
        "• Generarea de rapoarte și statistici",
        "• Comunicarea cu utilizatorii și suportul tehnic",
        "• Îmbunătățirea serviciilor noastre",
      ],
    },
    {
      id: "baza-legala",
      title: "4. Baza legală a prelucrării",
      icon: Lock,
      content: [
        "Prelucrarea datelor se bazează pe:",
        "• Consimțământul explicit al persoanei vizate (art. 6(1)(a) GDPR)",
        "• Executarea unui contract în care persoana vizată este parte (art. 6(1)(b) GDPR)",
        "• Interesul legitim al operatorului pentru îmbunătățirea serviciilor (art. 6(1)(f) GDPR)",
        "• Respectarea unei obligații legale (art. 6(1)(c) GDPR)",
      ],
    },
    {
      id: "partajarea-datelor",
      title: "5. Partajarea datelor cu terțe părți",
      icon: Eye,
      content: [
        "Nu vindem, nu închiriem și nu partajăm datele dvs. personale cu terțe părți, cu excepția:",
        "• Furnizorilor de servicii tehnice necesari pentru funcționarea platformei",
        "• Autorităților competente, în cazul unei cereri legale",
        "• În situații de urgență pentru protejarea siguranței utilizatorilor",
        "Toți partenerii noștri sunt obligați contractual să protejeze datele conform GDPR.",
      ],
    },
    {
      id: "drepturile-utilizatorilor",
      title: "6. Drepturile dvs.",
      icon: UserCheck,
      content: [
        "În conformitate cu GDPR, aveți următoarele drepturi:",
        "• Dreptul de acces la datele personale",
        "• Dreptul la rectificarea datelor inexacte",
        '• Dreptul la ștergerea datelor ("dreptul de a fi uitat")',
        "• Dreptul la restricționarea prelucrării",
        "• Dreptul la portabilitatea datelor",
        "• Dreptul de a vă opune prelucrării",
        "• Dreptul de a depune o plângere la autoritatea de supraveghere",
      ],
    },
    {
      id: "securitatea-datelor",
      title: "7. Securitatea datelor",
      icon: Shield,
      content: [
        "Implementăm măsuri tehnice și organizatorice adecvate pentru protejarea datelor:",
        "• Criptarea datelor în tranzit și în repaus",
        "• Autentificarea multi-factor pentru conturile administrative",
        "• Monitorizarea continuă a sistemelor pentru detectarea amenințărilor",
        "• Backup-uri regulate și planuri de recuperare în caz de dezastru",
        "• Instruirea personalului în domeniul protecției datelor",
      ],
    },
    {
      id: "pastrarea-datelor",
      title: "8. Păstrarea datelor",
      icon: Database,
      content: [
        "Păstrăm datele personale doar pe perioada necesară îndeplinirii scopurilor pentru care au fost colectate:",
        "• Datele de cont: pe toată durata utilizării serviciului + 1 an după închiderea contului",
        "• Citirile contoarelor: 5 ani pentru conformitatea cu legislația fiscală",
        "• Log-urile de sistem: maximum 2 ani",
        "• Datele de comunicare: 3 ani de la ultima interacțiune",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-16">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="secondary" className="mb-4">
                <Shield className="h-4 w-4 mr-2" />
                Protecția datelor
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                Politica de{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  Confidențialitate
                </span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                Transparența și protecția datelor dvs. personale sunt
                prioritățile noastre. Aflați cum colectăm, folosim și protejăm
                informațiile dvs.
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

              {/* Contact Section */}
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">9. Contact</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Pentru întrebări legate de această Politică de
                      Confidențialitate sau pentru exercitarea drepturilor dvs.,
                      ne puteți contacta:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Email:
                        </h4>
                        <p className="text-blue-600 dark:text-blue-400">
                          privacy@tbsa.ro
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Telefon:
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          +40 123 456 789
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Vom răspunde la cererea dvs. în maximum 30 de zile
                      calendaristice.
                    </p>
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
