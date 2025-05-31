"use client";

import { NavBar } from "@/components/navigation";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Users,
  Building2,
  Settings,
  Database,
  Activity,
  AlertTriangle,
  Crown,
  UserCog,
  Lock,
} from "lucide-react";

export default function SuperAdminDashboardPage() {
  return (
    <PermissionGuard
      permissions={["admin_grant:create:all"]}
      withRedirect={true}
      redirectTo="/dashboard"
    >
      <div className="min-h-screen bg-background">
        <NavBar />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Crown className="h-8 w-8 text-yellow-500" />
                  Super Admin Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                  Control complet asupra sistemului și gestionarea
                  administratorilor.
                </p>
              </div>
              <Badge variant="destructive" className="text-sm">
                <Shield className="h-3 w-3 mr-1" />
                Super Administrator
              </Badge>
            </div>
          </div>

          {/* Critical Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Button className="h-auto p-4 flex flex-col items-center space-y-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <UserCog className="h-6 w-6" />
              <span>Gestionează Admini</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 border-orange-200 hover:bg-orange-50"
            >
              <Settings className="h-6 w-6 text-orange-600" />
              <span>Configurări Sistem</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 border-red-200 hover:bg-red-50"
            >
              <Database className="h-6 w-6 text-red-600" />
              <span>Backup & Restore</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 border-green-200 hover:bg-green-50"
            >
              <Activity className="h-6 w-6 text-green-600" />
              <span>Monitorizare</span>
            </Button>
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Administratori
                </CardTitle>
                <Shield className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">8</div>
                <p className="text-xs text-muted-foreground">
                  +1 față de luna trecută
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Utilizatori
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">1,247</div>
                <p className="text-xs text-muted-foreground">
                  +89 față de luna trecută
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Clădiri
                </CardTitle>
                <Building2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">156</div>
                <p className="text-xs text-muted-foreground">
                  +12 față de luna trecută
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Alerte Active
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">3</div>
                <p className="text-xs text-muted-foreground">
                  -2 față de săptămâna trecută
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Administrators */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Administratori Sistem
                </CardTitle>
                <Button variant="ghost" size="sm">
                  Gestionează
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Crown className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Alexandru Popescu</p>
                        <p className="text-xs text-muted-foreground">
                          Super Administrator
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      SUPER ADMIN
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Maria Ionescu</p>
                        <p className="text-xs text-muted-foreground">
                          Administrator Sector 1
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      ADMIN
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Andrei Georgescu</p>
                        <p className="text-xs text-muted-foreground">
                          Administrator Sector 2
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      ADMIN
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Health & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-green-600" />
                  Securitate & Performanță
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Securitate sistem
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-600">
                        Excelent
                      </span>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Performanță server
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">98%</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "98%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Utilizare memorie
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">67%</span>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: "67%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Backup status
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-600">
                        Actualizat
                      </span>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">
                        Atenție
                      </span>
                    </div>
                    <p className="text-xs text-orange-700">
                      3 tentative de login eșuate detectate în ultimele 24h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </PermissionGuard>
  );
}
