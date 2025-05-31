"use client";

import { NavBar } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsumptionChart } from "@/components/ui/consumption-chart";
import { OwnerDashboardStats } from "@/components/owner/dashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Bine ai venit! Aici poți vedea o prezentare generală a activității
            tale.
          </p>
        </div>

        {/* Owner Stats */}
        <div className="mb-8">
          <OwnerDashboardStats />
        </div>

        {/* Grafic consum apă */}
        <div className="mb-8">
          <ConsumptionChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Activitate Recentă</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Citire nouă adăugată</p>
                    <p className="text-xs text-muted-foreground">
                      Apartament 12A - Bloc Central
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 min</span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Utilizator nou înregistrat
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Maria Popescu
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">15 min</span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Clădire actualizată</p>
                    <p className="text-xs text-muted-foreground">
                      Bloc Rezidențial Nord
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 oră</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistici Rapide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Citiri completate
                  </span>
                  <span className="text-sm font-medium">87%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: "87%" }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Apartamente ocupate
                  </span>
                  <span className="text-sm font-medium">94%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "94%" }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Utilizatori activi
                  </span>
                  <span className="text-sm font-medium">76%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "76%" }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
