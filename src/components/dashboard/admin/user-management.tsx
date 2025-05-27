import {
  Users,
  UserPlus,
  UserCheck,
  AlertTriangle,
  MoreVertical,
  Edit,
  Trash2,
  UserX,
  Eye,
  CheckCircle,
  XCircle,
  Mail,
  Shield,
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

interface UserAction {
  id: string;
  type: "new_registration" | "pending_approval" | "issue_reported";
  user: {
    name: string;
    email: string;
    apartment?: string;
    building?: string;
  };
  timestamp: string;
  priority: "high" | "medium" | "low";
}

const mockUserActions: UserAction[] = [
  {
    id: "1",
    type: "new_registration",
    user: {
      name: "Maria Popescu",
      email: "maria.popescu@email.com",
      apartment: "Apt. 12",
      building: "Bloc A",
    },
    timestamp: "2 ore",
    priority: "high",
  },
  {
    id: "2",
    type: "pending_approval",
    user: {
      name: "Ion Georgescu",
      email: "ion.georgescu@email.com",
      apartment: "Apt. 8",
      building: "Bloc B",
    },
    timestamp: "5 ore",
    priority: "medium",
  },
  {
    id: "3",
    type: "issue_reported",
    user: {
      name: "Ana Dumitrescu",
      email: "ana.dumitrescu@email.com",
      apartment: "Apt. 25",
      building: "Bloc C",
    },
    timestamp: "1 zi",
    priority: "high",
  },
];

const actionConfig = {
  new_registration: {
    icon: UserPlus,
    label: "Înregistrare Nouă",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
  },
  pending_approval: {
    icon: UserCheck,
    label: "Aprobare Necesară",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
  },
  issue_reported: {
    icon: AlertTriangle,
    label: "Problemă Raportată",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/20",
  },
};

export function UserManagement() {
  const handleUserAction = (
    actionType: string,
    userId: string,
    userName: string
  ) => {
    console.log(`Action: ${actionType} for user ${userName} (ID: ${userId})`);
    // TODO: Implementare acțiuni reale
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 dark:shadow-gray-900/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Gestionare Utilizatori
          </CardTitle>
          <Button variant="outline" size="sm">
            Vezi Toți
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {mockUserActions.map((action) => {
            const config = actionConfig[action.type];
            const IconComponent = config.icon;

            return (
              <div
                key={action.id}
                className={`p-3 sm:p-4 rounded-lg border ${config.bgColor} transition-all duration-200 hover:opacity-80`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`p-1.5 sm:p-2 rounded-lg bg-background ${config.color} flex-shrink-0`}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-sm sm:text-base text-foreground truncate">
                          {action.user.name}
                        </p>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-md font-medium flex-shrink-0 ${
                            action.priority === "high"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                              : action.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {action.priority === "high"
                            ? "Urgent"
                            : action.priority === "medium"
                            ? "Mediu"
                            : "Scăzut"}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-all">
                          {action.user.email}
                        </p>
                        {action.user.apartment && action.user.building && (
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {action.user.building}, {action.user.apartment}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {config.label} • acum {action.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Menu pentru acțiuni */}
                  <div className="flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">
                            Deschide meniu acțiuni
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>
                          Acțiuni Utilizator
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* Acțiuni de vizualizare */}
                        <DropdownMenuItem
                          onClick={() =>
                            handleUserAction(
                              "view",
                              action.id,
                              action.user.name
                            )
                          }
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Vezi Detalii
                        </DropdownMenuItem>

                        {/* Acțiuni specifice tipului */}
                        {action.type === "new_registration" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUserAction(
                                  "approve",
                                  action.id,
                                  action.user.name
                                )
                              }
                              className="cursor-pointer text-green-600 dark:text-green-400"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Aprobă Înregistrarea
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUserAction(
                                  "reject",
                                  action.id,
                                  action.user.name
                                )
                              }
                              className="cursor-pointer text-red-600 dark:text-red-400"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Respinge Înregistrarea
                            </DropdownMenuItem>
                          </>
                        )}

                        {action.type === "pending_approval" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUserAction(
                                  "approve",
                                  action.id,
                                  action.user.name
                                )
                              }
                              className="cursor-pointer text-green-600 dark:text-green-400"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Aprobă
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUserAction(
                                  "request_info",
                                  action.id,
                                  action.user.name
                                )
                              }
                              className="cursor-pointer text-blue-600 dark:text-blue-400"
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Solicită Informații
                            </DropdownMenuItem>
                          </>
                        )}

                        {action.type === "issue_reported" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUserAction(
                                  "resolve",
                                  action.id,
                                  action.user.name
                                )
                              }
                              className="cursor-pointer text-green-600 dark:text-green-400"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marchează Rezolvat
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUserAction(
                                  "escalate",
                                  action.id,
                                  action.user.name
                                )
                              }
                              className="cursor-pointer text-orange-600 dark:text-orange-400"
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Escaladează
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuSeparator />

                        {/* Acțiuni generale de management */}
                        <DropdownMenuItem
                          onClick={() =>
                            handleUserAction(
                              "edit",
                              action.id,
                              action.user.name
                            )
                          }
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editează Utilizator
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            handleUserAction(
                              "contact",
                              action.id,
                              action.user.name
                            )
                          }
                          className="cursor-pointer"
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Trimite Email
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Acțiuni critice */}
                        <DropdownMenuItem
                          onClick={() =>
                            handleUserAction(
                              "suspend",
                              action.id,
                              action.user.name
                            )
                          }
                          className="cursor-pointer text-orange-600 dark:text-orange-400"
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Suspendă Cont
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            handleUserAction(
                              "delete",
                              action.id,
                              action.user.name
                            )
                          }
                          className="cursor-pointer text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Șterge Utilizator
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div className="p-2 sm:p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <p className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400">
                3
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Noi
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <p className="text-lg sm:text-xl font-semibold text-yellow-600 dark:text-yellow-400">
                2
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Pending
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
              <p className="text-lg sm:text-xl font-semibold text-red-600 dark:text-red-400">
                1
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Probleme
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
