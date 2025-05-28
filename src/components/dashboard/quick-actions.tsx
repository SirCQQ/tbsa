"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import {
  Plus,
  Droplets,
  FileText,
  Users,
  Building2,
  Home,
  Settings,
} from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  const { user, hasPermission } = useAuth();

  if (!user) return null;

  // Use permissions instead of role checks
  const isAdmin = hasPermission("buildings:read:all");
  const canCreateBuildings = hasPermission("buildings:create:all");
  const canManageUsers = hasPermission("users:read:all");
  const canCreateApartments = hasPermission("apartments:create:own");
  const canSubmitReadings = hasPermission("water_readings:create:own");
  const canViewReports = hasPermission("buildings:read:all");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Acțiuni Rapide
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Admin Actions */}
          {canCreateBuildings && (
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/dashboard/admin/buildings/create">
                <Building2 className="h-6 w-6" />
                <span className="text-xs">Adaugă Clădire</span>
              </Link>
            </Button>
          )}

          {canManageUsers && (
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/dashboard/admin/users">
                <Users className="h-6 w-6" />
                <span className="text-xs">Utilizatori</span>
              </Link>
            </Button>
          )}

          {canViewReports && (
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/dashboard/admin/reports">
                <FileText className="h-6 w-6" />
                <span className="text-xs">Rapoarte</span>
              </Link>
            </Button>
          )}

          {/* Owner Actions */}
          {canCreateApartments && (
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/dashboard/apartments/create">
                <Home className="h-6 w-6" />
                <span className="text-xs">Adaugă Apartament</span>
              </Link>
            </Button>
          )}

          {canSubmitReadings && (
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/dashboard/readings/submit">
                <Droplets className="h-6 w-6" />
                <span className="text-xs">Trimite Citire</span>
              </Link>
            </Button>
          )}

          {/* Common Actions */}
          <Button asChild variant="outline" className="h-20 flex-col gap-2">
            <Link href="/settings">
              <Settings className="h-6 w-6" />
              <span className="text-xs">Setări</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
