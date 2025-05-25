"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/form";
import {
  User,
  Mail,
  Phone,
  Shield,
  ArrowLeft,
  Edit,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useAuthFeedback } from "@/hooks/use-auth-feedback";
import { useToast } from "@/hooks/use-toast";

type ProfileFormData = {
  firstName: string;
  lastName: string;
  phone?: string;
};

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { showAuthError } = useAuthFeedback();
  const { toast } = useToast();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleFormSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success toast
      toast({
        title: "Succes! 🎉",
        description: "Profilul a fost actualizat cu succes!",
        variant: "default",
        duration: 4000,
      });

      setIsEditing(false);
    } catch (error) {
      showAuthError(
        "Eroare la actualizarea profilului. Încearcă din nou.",
        "Eroare"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Înapoi la Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profilul Meu
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestionează informațiile contului tău
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informații Personale
                    </CardTitle>
                    <CardDescription>
                      Actualizează datele tale personale
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editează
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <ProfileForm
                    user={user}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancel}
                    isLoading={isSaving}
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Prenume
                        </p>
                        <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                          {user.firstName}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Nume
                        </p>
                        <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                          {user.lastName}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </p>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded-md flex-1">
                          {user.email}
                        </p>
                        <Badge variant="secondary">Nu poate fi modificat</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Telefon
                      </p>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded-md flex-1">
                          {user.phone || "Nu este specificat"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rol
                      </p>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Badge variant={isAdmin ? "default" : "secondary"}>
                          {isAdmin ? "Administrator" : "Proprietar"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Rezumat Cont</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Membru din</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("ro-RO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200"
                  >
                    Activ
                  </Badge>
                </div>
                {user.owner && user.owner.apartments && (
                  <div>
                    <p className="text-sm font-medium">Apartamente</p>
                    <p className="text-sm text-muted-foreground">
                      {user.owner.apartments.length} apartament
                      {user.owner.apartments.length !== 1 ? "e" : ""}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Owner Specific Info */}
            {user.owner &&
              user.owner.apartments &&
              user.owner.apartments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Apartamentele Mele
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {user.owner.apartments.map((apartment, index) => (
                        <div
                          key={apartment.id || index}
                          className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <p className="text-sm font-medium">
                            Apartament {apartment.number || `#${index + 1}`}
                          </p>
                          {apartment.building && (
                            <p className="text-xs text-muted-foreground">
                              {apartment.building.name}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle>Securitate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Schimbă Parola
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Istoric Conectări
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                >
                  Șterge Contul
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
