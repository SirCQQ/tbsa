"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreateRoleModal } from "./create-role-modal";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Plus, Shield, Users, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Permission {
  id: string;
  resource: string;
  action: string;
  scope: string | null;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissionCount: number;
  permissions: Permission[];
}

interface RolesResponse {
  roles: Role[];
  allPermissions: Permission[];
}

async function fetchRoles(): Promise<RolesResponse> {
  const response = await fetch("/api/permissions/roles", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch roles");
  }

  return response.json();
}

export function RolesManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });

  const createRoleMutation = useMutation({
    mutationFn: async (roleData: {
      name: string;
      description: string;
      permissionIds: string[];
    }) => {
      const response = await fetch("/api/permissions/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsCreateModalOpen(false);
      toast.success("Rolul a fost creat cu succes!");
    },
    onError: (error: Error) => {
      toast.error(`Eroare la crearea rolului: ${error.message}`);
    },
  });

  const getResourceBadgeColor = (resource: string) => {
    const colors: Record<string, string> = {
      buildings: "bg-blue-100 text-blue-800 border-blue-200",
      apartments: "bg-green-100 text-green-800 border-green-200",
      users: "bg-purple-100 text-purple-800 border-purple-200",
      water_readings: "bg-cyan-100 text-cyan-800 border-cyan-200",
      invite_codes: "bg-orange-100 text-orange-800 border-orange-200",
      roles: "bg-red-100 text-red-800 border-red-200",
      admin_grant: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return colors[resource] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "read":
        return "👁️";
      case "create":
        return "➕";
      case "update":
        return "✏️";
      case "delete":
        return "🗑️";
      default:
        return "🔧";
    }
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatResourceName = (resource: string) => {
    return resource
      .split("_")
      .map((word) => capitalizeFirst(word))
      .join(" ");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Eroare la încărcarea rolurilor</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Roluri Sistem</h2>
        </div>

        <PermissionGuard
          permission="roles:create:all"
          fallback={
            <Alert className="w-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Acces Restricționat</AlertTitle>
              <AlertDescription>
                Doar SUPER_ADMIN poate crea roluri noi.
              </AlertDescription>
            </Alert>
          }
          showLoading={true}
        >
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Creează Rol
          </Button>
        </PermissionGuard>
      </div>

      <PermissionGuard
        permission="roles:read:all"
        fallback={
          <Card>
            <CardContent className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nu ai acces la vizualizarea rolurilor
              </p>
            </CardContent>
          </Card>
        }
        showLoading={true}
      >
        <div className="grid gap-6">
          {data?.roles.map((role) => {
            // Group permissions by resource and sort them
            const groupedPermissions = role.permissions.reduce(
              (groups, permission) => {
                if (!groups[permission.resource]) {
                  groups[permission.resource] = [];
                }
                groups[permission.resource].push(permission);
                return groups;
              },
              {} as Record<string, Permission[]>
            );

            // Sort resources alphabetically
            const sortedResources = Object.keys(groupedPermissions).sort();

            return (
              <Card
                key={role.id}
                className={role.isSystem ? "border-muted bg-muted/50" : ""}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CardTitle className="flex items-center space-x-2">
                        {role.isSystem ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Users className="h-4 w-4" />
                        )}
                        <span>{role.name}</span>
                      </CardTitle>
                      {role.isSystem && (
                        <Badge variant="secondary">Sistem</Badge>
                      )}
                    </div>
                    <Badge variant="outline">
                      {role.permissionCount} permisiuni
                    </Badge>
                  </div>
                  {role.description && (
                    <CardDescription>{role.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Permisiuni:</h4>
                    <div className="grid gap-2">
                      {role.permissions.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Resursă</TableHead>
                              <TableHead>Acțiune</TableHead>
                              <TableHead>Domeniu</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedResources.map((resource) =>
                              groupedPermissions[resource].map(
                                (permission, index) => (
                                  <TableRow key={permission.id}>
                                    <TableCell>
                                      {index === 0 ? (
                                        <Badge
                                          className={getResourceBadgeColor(
                                            resource
                                          )}
                                        >
                                          {formatResourceName(resource)}
                                        </Badge>
                                      ) : (
                                        <div className="w-4" />
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center space-x-2">
                                        <span>
                                          {getActionIcon(permission.action)}
                                        </span>
                                        <span className="capitalize">
                                          {capitalizeFirst(permission.action)}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline">
                                        {permission.scope
                                          ? capitalizeFirst(permission.scope)
                                          : "N/A"}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                )
                              )
                            )}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Nicio permisiune atribuită
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </PermissionGuard>

      <PermissionGuard permission="roles:create:all">
        <CreateRoleModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(roleData) => createRoleMutation.mutate(roleData)}
          isLoading={createRoleMutation.isPending}
          availablePermissions={data?.allPermissions || []}
        />
      </PermissionGuard>
    </div>
  );
}
