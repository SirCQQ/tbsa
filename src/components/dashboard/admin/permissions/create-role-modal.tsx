"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ControlledInput } from "@/components/ui/inputs/form/controlled-input";
import { ControlledTextarea } from "@/components/ui/inputs/form/controlled-textarea";

interface Permission {
  id: string;
  resource: string;
  action: string;
  scope: string | null;
}

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    permissionIds: string[];
  }) => void;
  isLoading: boolean;
  availablePermissions: Permission[];
}

const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, "Numele rolului este obligatoriu")
    .max(50, "Numele este prea lung"),
  description: z
    .string()
    .min(1, "Descrierea este obligatorie")
    .max(200, "Descrierea este prea lungă"),
  permissionIds: z
    .array(z.string())
    .min(1, "Selectează cel puțin o permisiune"),
});

type CreateRoleFormData = z.infer<typeof createRoleSchema>;

export function CreateRoleModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  availablePermissions,
}: CreateRoleModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissionIds: [],
    },
  });

  const handleSubmit = (data: CreateRoleFormData) => {
    onSubmit({
      ...data,
      permissionIds: selectedPermissions,
    });
  };

  const handleClose = () => {
    form.reset();
    setSelectedPermissions([]);
    onClose();
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      const newSelection = prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId];

      form.setValue("permissionIds", newSelection);
      return newSelection;
    });
  };

  const selectAllForResource = (resource: string) => {
    const resourcePermissions = availablePermissions
      .filter((p) => p.resource === resource)
      .map((p) => p.id);

    const allSelected = resourcePermissions.every((id) =>
      selectedPermissions.includes(id)
    );

    if (allSelected) {
      // Deselect all for this resource
      setSelectedPermissions((prev) =>
        prev.filter((id) => !resourcePermissions.includes(id))
      );
    } else {
      // Select all for this resource
      setSelectedPermissions((prev) => {
        const newSelection = [...prev];
        resourcePermissions.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  // Group permissions by resource
  const groupedPermissions = availablePermissions.reduce(
    (groups, permission) => {
      if (!groups[permission.resource]) {
        groups[permission.resource] = [];
      }
      groups[permission.resource].push(permission);
      return groups;
    },
    {} as Record<string, Permission[]>
  );

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

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatResourceName = (resource: string) => {
    return resource
      .split("_")
      .map((word) => capitalizeFirst(word))
      .join(" ");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Creează Rol Nou</DialogTitle>
          <DialogDescription>
            Creează un rol personalizat cu permisiuni specifice pentru
            utilizatori.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <ControlledInput
                name="name"
                label="Nume Rol"
                placeholder="ex: BUILDING_MANAGER"
                helperText="Numele rolului (se recomandă UPPER_CASE)"
                required
              />

              <ControlledTextarea
                name="description"
                label="Descriere"
                placeholder="Descrierea rolului și responsabilitățile acestuia"
                className="resize-none"
              />
            </div>

            <FormField
              control={form.control}
              name="permissionIds"
              render={() => (
                <FormItem>
                  <FormLabel>Permisiuni</FormLabel>
                  <FormDescription>
                    Selectează permisiunile pentru acest rol. Poți selecta toate
                    permisiunile pentru o resursă.
                  </FormDescription>
                  <ScrollArea className="h-96 w-full border rounded-md p-4">
                    <div className="space-y-4">
                      {Object.entries(groupedPermissions).map(
                        ([resource, permissions]) => (
                          <Card key={resource}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm flex items-center space-x-2">
                                  <Badge
                                    className={getResourceBadgeColor(resource)}
                                  >
                                    {formatResourceName(resource)}
                                  </Badge>
                                </CardTitle>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => selectAllForResource(resource)}
                                >
                                  {permissions.every((p) =>
                                    selectedPermissions.includes(p.id)
                                  )
                                    ? "Deselectează toate"
                                    : "Selectează toate"}
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="grid grid-cols-2 gap-2">
                                {permissions.map((permission) => (
                                  <div
                                    key={permission.id}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={permission.id}
                                      checked={selectedPermissions.includes(
                                        permission.id
                                      )}
                                      onCheckedChange={() =>
                                        togglePermission(permission.id)
                                      }
                                    />
                                    <label
                                      htmlFor={permission.id}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                      <span className="capitalize">
                                        {capitalizeFirst(permission.action)}
                                      </span>
                                      {permission.scope && (
                                        <Badge
                                          variant="outline"
                                          className="ml-2 text-xs"
                                        >
                                          {capitalizeFirst(permission.scope)}
                                        </Badge>
                                      )}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </div>
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Anulează
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Se creează..." : "Creează Rol"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
