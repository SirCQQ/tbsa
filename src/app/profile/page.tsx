"use client";

import { NavBar } from "@/components/navigation";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  Camera,
} from "lucide-react";

export default function ProfilePage() {
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
            <h1 className="text-3xl font-bold text-foreground">Profil</h1>
            <p className="text-muted-foreground mt-2">
              Gestionează informațiile tale personale și setările contului.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="/placeholder-avatar.jpg" />
                        <AvatarFallback className="text-lg">AP</AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle>Alexandru Popescu</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    alexandru.popescu@email.com
                  </p>
                  <div className="flex justify-center mt-2">
                    <Badge variant="secondary">Proprietar</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Apartament 12A, Bloc Central</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Membru din Ianuarie 2024</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>+40 123 456 789</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Statistici Rapide</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Citiri trimise
                      </span>
                      <span className="text-sm font-medium">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Ultima citire
                      </span>
                      <span className="text-sm font-medium">15 Dec 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status cont
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Activ
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Informații Personale</CardTitle>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editează
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prenume</Label>
                      <Input id="firstName" defaultValue="Alexandru" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nume</Label>
                      <Input id="lastName" defaultValue="Popescu" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="alexandru.popescu@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input id="phone" defaultValue="+40 123 456 789" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Data nașterii</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        defaultValue="1985-03-15"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Adresa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="building">Clădire</Label>
                        <Input
                          id="building"
                          defaultValue="Bloc Rezidențial Central"
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apartment">Apartament</Label>
                        <Input id="apartment" defaultValue="12A" disabled />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresa completă</Label>
                      <Input
                        id="address"
                        defaultValue="Str. Mihai Eminescu 15, București"
                        disabled
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="bio">Despre mine</Label>
                    <Textarea
                      id="bio"
                      placeholder="Spune-ne ceva despre tine..."
                      defaultValue="Sunt proprietarul apartamentului 12A din Bloc Central. Îmi place să mențin o comunicare deschisă cu vecinii și să contribui la bunăstarea comunității noastre."
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Anulează</Button>
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Salvează modificările
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Account Security */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Securitate Cont</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Parolă</h4>
                      <p className="text-sm text-muted-foreground">
                        Ultima modificare acum 3 luni
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Schimbă parola
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        Autentificare cu doi factori
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Adaugă un nivel suplimentar de securitate
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Activează
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Sesiuni active</h4>
                      <p className="text-sm text-muted-foreground">
                        Gestionează dispozitivele conectate
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Vezi sesiuni
                    </Button>
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
