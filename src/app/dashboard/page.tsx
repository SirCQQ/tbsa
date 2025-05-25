"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Droplets,
  Calendar,
  Settings,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isAdmin = user.role === "ADMINISTRATOR";
  const isOwner = user.role === "OWNER";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Bun venit, {user.firstName} {user.lastName}!
          </p>
          <Badge variant={isAdmin ? "default" : "secondary"} className="mt-2">
            {isAdmin ? "Administrator" : "Proprietar"}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isAdmin && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Clădiri
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    +2 față de luna trecută
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Proprietari Activi
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">248</div>
                  <p className="text-xs text-muted-foreground">
                    +12% față de luna trecută
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Citiri Lunare
              </CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isOwner ? "3" : "1,247"}
              </div>
              <p className="text-xs text-muted-foreground">
                {isOwner ? "Apartamente" : "Total citiri"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Deadline Citiri
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">25</div>
              <p className="text-xs text-muted-foreground">Ianuarie 2024</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Activitate Recentă
                </CardTitle>
                <CardDescription>Ultimele acțiuni din sistem</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isAdmin ? (
                    <>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Citire validată pentru Bloc A, Apt. 15
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Acum 2 ore
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Citire în așteptare pentru Bloc B, Apt. 7
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Acum 4 ore
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Proprietar nou înregistrat: Maria Popescu
                          </p>
                          <p className="text-xs text-muted-foreground">Ieri</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Citire trimisă pentru Apt. 15A
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Acum 1 zi
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Reminder: Citire în așteptare pentru Apt. 15B
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Deadline: 25 Ianuarie
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Factură generată pentru luna Decembrie
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Acum 3 zile
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acțiuni Rapide</CardTitle>
                <CardDescription>
                  Funcționalități frecvent utilizate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isAdmin ? (
                    <>
                      <Button
                        className="h-auto p-4 flex flex-col items-start gap-2"
                        variant="outline"
                      >
                        <Building2 className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Gestionează Clădiri</div>
                          <div className="text-xs text-muted-foreground">
                            Adaugă sau editează clădiri
                          </div>
                        </div>
                      </Button>
                      <Button
                        className="h-auto p-4 flex flex-col items-start gap-2"
                        variant="outline"
                      >
                        <Users className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">
                            Gestionează Proprietari
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Vizualizează și editează proprietari
                          </div>
                        </div>
                      </Button>
                      <Button
                        className="h-auto p-4 flex flex-col items-start gap-2"
                        variant="outline"
                      >
                        <Droplets className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Validează Citiri</div>
                          <div className="text-xs text-muted-foreground">
                            Verifică citrile trimise
                          </div>
                        </div>
                      </Button>
                      <Button
                        className="h-auto p-4 flex flex-col items-start gap-2"
                        variant="outline"
                      >
                        <FileText className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Generează Rapoarte</div>
                          <div className="text-xs text-muted-foreground">
                            Rapoarte de consum și facturare
                          </div>
                        </div>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        className="h-auto p-4 flex flex-col items-start gap-2"
                        variant="outline"
                      >
                        <Droplets className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Trimite Citire</div>
                          <div className="text-xs text-muted-foreground">
                            Înregistrează consumul de apă
                          </div>
                        </div>
                      </Button>
                      <Button
                        className="h-auto p-4 flex flex-col items-start gap-2"
                        variant="outline"
                      >
                        <FileText className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Istoric Citiri</div>
                          <div className="text-xs text-muted-foreground">
                            Vizualizează citrile anterioare
                          </div>
                        </div>
                      </Button>
                      <Button
                        className="h-auto p-4 flex flex-col items-start gap-2"
                        variant="outline"
                      >
                        <Calendar className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">
                            Programează Reminder
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Notificări pentru citiri
                          </div>
                        </div>
                      </Button>
                      <Button
                        className="h-auto p-4 flex flex-col items-start gap-2"
                        variant="outline"
                      >
                        <TrendingUp className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Analiză Consum</div>
                          <div className="text-xs text-muted-foreground">
                            Grafice și statistici
                          </div>
                        </div>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profilul Meu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Nume</p>
                  <p className="text-sm text-muted-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Telefon</p>
                  <p className="text-sm text-muted-foreground">
                    {user.phone || "Nu este specificat"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Rol</p>
                  <Badge variant={isAdmin ? "default" : "secondary"}>
                    {isAdmin ? "Administrator" : "Proprietar"}
                  </Badge>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/profile">
                    <Settings className="h-4 w-4 mr-2" />
                    Editează Profilul
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Notificări</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isOwner && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">
                          Citire în așteptare
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Deadline: 25 Ianuarie 2024
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        {isAdmin
                          ? "Raport lunar disponibil"
                          : "Factură disponibilă"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isAdmin ? "Decembrie 2023" : "Pentru luna Decembrie"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Link-uri Utile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/help">Ajutor și Suport</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/contact">Contactează-ne</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/terms">Termeni și Condiții</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
