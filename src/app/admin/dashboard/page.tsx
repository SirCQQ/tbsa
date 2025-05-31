"use client";

import { NavBar } from "@/components/navigation";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Home,
  Users,
  Droplets,
  Plus,
  Settings,
  BarChart3,
  UserCheck,
} from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <PermissionGuard
      permissions={[
        "buildings:read:all",
        "apartments:read:all",
        "users:read:all",
      ]}
      requireAll={false}
      withRedirect={true}
      redirectTo="/dashboard"
    >
      <div className="min-h-screen bg-background">
        <NavBar />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                  Gestionează clădirile, apartamentele și utilizatorii din
                  sistem.
                </p>
              </div>
              <Badge variant="secondary" className="text-sm">
                Administrator
              </Badge>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <PermissionGuard permissions={["buildings:create:all"]}>
              <Button className="h-auto p-4 flex flex-col items-center space-y-2">
                <Plus className="h-6 w-6" />
                <span>Adaugă Clădire</span>
              </Button>
            </PermissionGuard>

            <PermissionGuard permissions={["apartments:create:all"]}>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Home className="h-6 w-6" />
                <span>Adaugă Apartament</span>
              </Button>
            </PermissionGuard>

            <PermissionGuard permissions={["users:create:all"]}>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <UserCheck className="h-6 w-6" />
                <span>Invită Utilizator</span>
              </Button>
            </PermissionGuard>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <BarChart3 className="h-6 w-6" />
              <span>Rapoarte</span>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <PermissionGuard permissions={["buildings:read:all"]}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Clădiri
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    +3 față de luna trecută
                  </p>
                </CardContent>
              </Card>
            </PermissionGuard>

            <PermissionGuard permissions={["apartments:read:all"]}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Apartamente
                  </CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">486</div>
                  <p className="text-xs text-muted-foreground">
                    +18 față de luna trecută
                  </p>
                </CardContent>
              </Card>
            </PermissionGuard>

            <PermissionGuard permissions={["users:read:all"]}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Utilizatori
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">342</div>
                  <p className="text-xs text-muted-foreground">
                    +24 față de luna trecută
                  </p>
                </CardContent>
              </Card>
            </PermissionGuard>

            <PermissionGuard permissions={["water_readings:read:all"]}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Citiri Luna Aceasta
                  </CardTitle>
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,847</div>
                  <p className="text-xs text-muted-foreground">
                    +156 față de luna trecută
                  </p>
                </CardContent>
              </Card>
            </PermissionGuard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Buildings */}
            <PermissionGuard permissions={["buildings:read:all"]}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Clădiri Recente</CardTitle>
                  <Button variant="ghost" size="sm">
                    Vezi toate
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Bloc Rezidențial Central
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Str. Mihai Eminescu 15
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">48 apt</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Ansamblu Nord Plaza
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Bd. Nicolae Bălcescu 22
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">72 apt</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Complex Sunset</p>
                          <p className="text-xs text-muted-foreground">
                            Str. Florilor 8
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">36 apt</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PermissionGuard>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status Sistem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Citiri completate (luna aceasta)
                    </span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "92%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Apartamente cu proprietari
                    </span>
                    <span className="text-sm font-medium">87%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: "87%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Utilizatori activi (7 zile)
                    </span>
                    <span className="text-sm font-medium">74%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: "74%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Performanță sistem
                    </span>
                    <span className="text-sm font-medium">98%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: "98%" }}
                    ></div>
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
