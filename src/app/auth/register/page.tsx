"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { OrganizationRegisterForm } from "@/components/auth/organization-register-form";
import { UserRegisterForm } from "@/components/auth/user-register-form";
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("organization");

  return (
    <BackgroundGradient className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl backdrop-blur-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Înregistrare</CardTitle>
          <CardDescription>
            Creați un cont nou pentru a accesa platforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="organization" className="text-sm">
                Pentru Organizații
              </TabsTrigger>
              <TabsTrigger value="user" className="text-sm">
                Pentru Utilizatori
              </TabsTrigger>
            </TabsList>

            {/* Organization Registration */}
            <TabsContent value="organization" className="space-y-6">
              <OrganizationRegisterForm />
            </TabsContent>

            {/* User Registration */}
            <TabsContent value="user" className="space-y-6">
              <UserRegisterForm />
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm mt-6">
            <span className="text-muted-foreground">Aveți deja un cont? </span>
            <Link
              href="/auth/signin"
              className="underline underline-offset-4 hover:text-primary"
            >
              Conectați-vă
            </Link>
          </div>
        </CardContent>
      </Card>
    </BackgroundGradient>
  );
}
