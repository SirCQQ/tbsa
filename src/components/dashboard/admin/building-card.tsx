"use client";

import {
  MapPin,
  Users,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { BuildingWithDetails } from "@/services/buildings.service";

interface BuildingCardProps {
  building: BuildingWithDetails;
  onAction: (
    actionType: string,
    buildingId: string,
    buildingName: string
  ) => void;
  isDeleting?: boolean;
}

export function BuildingCard({
  building,
  onAction,
  isDeleting = false,
}: BuildingCardProps) {
  const handleCardClick = () => {
    onAction("view", building.id, building.name);
  };

  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 dark:shadow-gray-900/20 cursor-pointer active:scale-95"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              {building.name}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {building.city}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                disabled={isDeleting}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acțiuni</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onAction("view", building.id, building.name)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Vezi Detalii
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAction("edit", building.id, building.name)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editează
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onAction("apartments", building.id, building.name)
                }
              >
                <Home className="mr-2 h-4 w-4" />
                Gestionează Apartamente
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onAction("delete", building.id, building.name)}
                className="text-red-600 dark:text-red-400"
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Șterge
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="truncate">{building.address}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4 mr-2" />
            <span>{building._count.apartments} apartamente</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Termen: {building.readingDeadline}
          </Badge>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500">
          Administrator: {building.administrator.user.firstName}{" "}
          {building.administrator.user.lastName}
        </div>
      </CardContent>
    </Card>
  );
}
