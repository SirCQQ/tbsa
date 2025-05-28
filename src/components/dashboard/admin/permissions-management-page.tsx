"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RolesManagement } from "./permissions/roles-management";
import { UsersManagement } from "./permissions/users-management";
import { Shield, Users, UserCog } from "lucide-react";

export function PermissionsManagementPage() {
  const [activeTab, setActiveTab] = useState("roles");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Gestionare Permisiuni</h1>
      </div>

      <p className="text-muted-foreground">
        Gestionează rolurile, permisiunile și accesul utilizatorilor la sistem.
      </p>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles" className="flex items-center space-x-2">
            <UserCog className="h-4 w-4" />
            <span>Roluri & Permisiuni</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Utilizatori</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestionare Roluri</CardTitle>
              <CardDescription>
                Creează și gestionează rolurile sistemului cu permisiuni
                granulare.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RolesManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestionare Utilizatori</CardTitle>
              <CardDescription>
                Vizualizează și modifică rolurile utilizatorilor din sistem.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
