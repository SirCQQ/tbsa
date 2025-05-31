"use client";

import { NavBar } from "@/components/navigation";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Shield,
  Palette,
  Globe,
  Moon,
  Sun,
  Monitor,
  Download,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <PermissionGuard
        permissions={["users:update:own"]}
        withRedirect={true}
        redirectTo="/dashboard"
        fallback={
          <main className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Acces Restricționat
              </h1>
              <p className="text-muted-foreground">
                Nu ai permisiunea să accesezi această pagină.
              </p>
            </div>
          </main>
        }
      >
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Setări</h1>
            <p className="text-muted-foreground mt-2">
              Personalizează experiența ta și gestionează preferințele contului.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categorii</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Notificări
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Palette className="h-4 w-4 mr-2" />
                    Aspect
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Globe className="h-4 w-4 mr-2" />
                    Limbă & Regiune
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Confidențialitate
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Date & Export
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cont
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notificări
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Notificări email</Label>
                        <p className="text-sm text-muted-foreground">
                          Primește notificări importante prin email
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Notificări push</Label>
                        <p className="text-sm text-muted-foreground">
                          Notificări în timp real în browser
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Citiri contor</Label>
                        <p className="text-sm text-muted-foreground">
                          Reamintiri pentru citirea contorului
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Anunțuri comunitate</Label>
                        <p className="text-sm text-muted-foreground">
                          Anunțuri de la administrația blocului
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">
                          Notificări marketing
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Noutăți și oferte speciale
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Frecvența notificărilor</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emailFreq">Email</Label>
                        <Select defaultValue="daily">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instant">Instant</SelectItem>
                            <SelectItem value="daily">Zilnic</SelectItem>
                            <SelectItem value="weekly">Săptămânal</SelectItem>
                            <SelectItem value="never">Niciodată</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pushFreq">Push</Label>
                        <Select defaultValue="instant">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instant">Instant</SelectItem>
                            <SelectItem value="daily">Zilnic</SelectItem>
                            <SelectItem value="never">Niciodată</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="h-5 w-5 mr-2" />
                    Aspect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Temă</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <Button variant="outline" className="h-20 flex-col">
                          <Sun className="h-6 w-6 mb-2" />
                          Luminos
                        </Button>
                        <Button variant="outline" className="h-20 flex-col">
                          <Moon className="h-6 w-6 mb-2" />
                          Întunecat
                        </Button>
                        <Button
                          variant="outline"
                          className="h-20 flex-col border-primary"
                        >
                          <Monitor className="h-6 w-6 mb-2" />
                          Sistem
                          <Badge variant="secondary" className="text-xs mt-1">
                            Activ
                          </Badge>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fontSize">Mărimea fontului</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Mic</SelectItem>
                          <SelectItem value="medium">Mediu</SelectItem>
                          <SelectItem value="large">Mare</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Animații reduse</Label>
                        <p className="text-sm text-muted-foreground">
                          Reduce animațiile pentru performanță mai bună
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Language & Region */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Limbă & Regiune
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Limbă</Label>
                      <Select defaultValue="ro">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ro">Română</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hu">Magyar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Fus orar</Label>
                      <Select defaultValue="europe/bucharest">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="europe/bucharest">
                            Europa/București
                          </SelectItem>
                          <SelectItem value="europe/london">
                            Europa/Londra
                          </SelectItem>
                          <SelectItem value="america/new_york">
                            America/New York
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Format dată</Label>
                      <Select defaultValue="dd/mm/yyyy">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Monedă</Label>
                      <Select defaultValue="ron">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ron">RON (Lei)</SelectItem>
                          <SelectItem value="eur">EUR (Euro)</SelectItem>
                          <SelectItem value="usd">USD (Dolari)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Confidențialitate
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Profil public</Label>
                        <p className="text-sm text-muted-foreground">
                          Permite altor rezidenți să vadă profilul tău
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">
                          Partajare date analitice
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Ajută-ne să îmbunătățim aplicația
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Cookies marketing</Label>
                        <p className="text-sm text-muted-foreground">
                          Pentru conținut personalizat
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Gestionare date</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descarcă datele mele
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Vezi politica de confidențialitate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Management */}
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-destructive">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Zona Periculoasă
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Dezactivare cont</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Dezactivează temporar contul tău. Poți să-l reactivezi
                        oricând.
                      </p>
                      <Button variant="outline">Dezactivează contul</Button>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2 text-destructive">
                        Ștergere cont
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Șterge permanent contul și toate datele asociate.
                        Această acțiune nu poate fi anulată.
                      </p>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Șterge contul permanent
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </PermissionGuard>
    </div>
  );
}
