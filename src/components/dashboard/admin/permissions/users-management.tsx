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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Users, Search, UserCheck, Building, Home } from "lucide-react";
import { toast } from "sonner";

interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  role: Role;
  administrator: { id: string } | null;
  owner: {
    id: string;
    apartments: {
      id: string;
      number: string;
      building: {
        name: string;
      };
    }[];
  } | null;
}

interface UsersResponse {
  users: User[];
}

interface RolesResponse {
  roles: Role[];
}

async function fetchUsers(): Promise<UsersResponse> {
  const response = await fetch("/api/permissions/users", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
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

export function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      roleId,
    }: {
      userId: string;
      roleId: string;
    }) => {
      const response = await fetch("/api/permissions/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId, roleId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Rolul a fost atribuit cu succes!");
    },
    onError: (error: Error) => {
      toast.error(`Eroare la atribuirea rolului: ${error.message}`);
    },
  });

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case "SUPER_ADMIN":
        return "destructive";
      case "ADMINISTRATOR":
        return "default";
      case "OWNER":
        return "secondary";
      default:
        return "outline";
    }
  };

  const filteredUsers =
    usersData?.users.filter((user) => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role.name === roleFilter;

      return matchesSearch && matchesRole;
    }) || [];

  if (usersLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Eroare la încărcarea utilizatorilor</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Utilizatori Sistem</h2>
        </div>
        <Badge variant="outline">{filteredUsers.length} utilizatori</Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtre</CardTitle>
          <CardDescription>
            Filtrează utilizatorii după nume, email sau rol.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Caută după nume sau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrează după rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate rolurile</SelectItem>
                {rolesData?.roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista Utilizatori</CardTitle>
          <CardDescription>
            Gestionează rolurile utilizatorilor din sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilizator</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol Curent</TableHead>
                <TableHead>Profil</TableHead>
                <TableHead>Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                      {user.phone && (
                        <span className="text-sm text-muted-foreground">
                          {user.phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role.name)}>
                      {user.role.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {user.administrator && (
                        <Badge
                          variant="outline"
                          className="flex items-center space-x-1"
                        >
                          <Building className="h-3 w-3" />
                          <span>Admin</span>
                        </Badge>
                      )}
                      {user.owner && (
                        <Badge
                          variant="outline"
                          className="flex items-center space-x-1"
                        >
                          <Home className="h-3 w-3" />
                          <span>
                            Proprietar ({user.owner.apartments.length})
                          </span>
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role.id}
                      onValueChange={(roleId) =>
                        assignRoleMutation.mutate({ userId: user.id, roleId })
                      }
                      disabled={assignRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {rolesData?.roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex items-center space-x-2">
                              <span>{role.name}</span>
                              {role.isSystem && (
                                <Badge variant="secondary" className="text-xs">
                                  Sistem
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nu au fost găsiți utilizatori cu criteriile selectate.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
