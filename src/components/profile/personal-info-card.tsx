import { useState } from "react";
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
import { User, Mail, Phone, Shield, Edit } from "lucide-react";
import type { SafeUser } from "@/types/auth";
import { useAuthFeedback } from "@/hooks/use-auth-feedback";
import { useToast } from "@/hooks/use-toast";

type ProfileFormData = {
  firstName: string;
  lastName: string;
  phone?: string;
};

type PersonalInfoCardProps = {
  user: SafeUser;
};

export function PersonalInfoCard({ user }: PersonalInfoCardProps) {
  const { showAuthError } = useAuthFeedback();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = user.role === "ADMINISTRATOR";

  const handleFormSubmit = async (_data: ProfileFormData) => {
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
    } catch (_error) {
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
  );
}
