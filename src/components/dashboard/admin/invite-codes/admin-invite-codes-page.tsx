"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Copy,
  Ban,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  useInviteCodes,
  useCancelInviteCode,
} from "@/hooks/api/use-invite-codes";
import { CreateInviteCodeModal } from "./create-invite-code-modal";
import { InviteCodeStatus } from "@/types/invite-codes.types";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { useApartments } from "@/hooks/api/use-apartments";
import { useAuth } from "@/contexts/auth-context";

const statusConfig = {
  [InviteCodeStatus.ACTIVE]: {
    label: "Activ",
    variant: "default" as const,
    icon: Clock,
    color: "text-blue-500",
  },
  [InviteCodeStatus.USED]: {
    label: "Folosit",
    variant: "secondary" as const,
    icon: CheckCircle,
    color: "text-green-500",
  },
  [InviteCodeStatus.EXPIRED]: {
    label: "Expirat",
    variant: "destructive" as const,
    icon: XCircle,
    color: "text-red-500",
  },
  [InviteCodeStatus.REVOKED]: {
    label: "Anulat",
    variant: "outline" as const,
    icon: AlertCircle,
    color: "text-orange-500",
  },
};

export function AdminInviteCodesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Get current user and check if they're an administrator
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Only use administrator ID if user is loaded and is actually an administrator
  const administratorId = user?.administrator?.id;

  // All hooks must be called before any early returns
  const {
    data: inviteCodes,
    isLoading,
    error,
  } = useInviteCodes(administratorId);
  const cancelInviteCode = useCancelInviteCode();
  console.log({ inviteCodes });
  // Get apartments for the dropdown (if needed in the future)
  const { data: _apartments } = useApartments({
    buildingId: "",
    page: 1,
    limit: 100,
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!inviteCodes) {
      return { total: 0, active: 0, used: 0, expired: 0 };
    }

    return {
      total: inviteCodes.length,
      active: inviteCodes.filter(
        (code) => code.status === InviteCodeStatus.ACTIVE
      ).length,
      used: inviteCodes.filter((code) => code.status === InviteCodeStatus.USED)
        .length,
      expired: inviteCodes.filter(
        (code) => code.status === InviteCodeStatus.EXPIRED
      ).length,
    };
  }, [inviteCodes]);

  // Filter codes based on search
  const filteredCodes = useMemo(() => {
    if (!inviteCodes) return [];

    return inviteCodes.filter((code) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        code.code.toLowerCase().includes(searchLower) ||
        code.apartment.number.toLowerCase().includes(searchLower) ||
        code.apartment.building.name.toLowerCase().includes(searchLower)
      );
    });
  }, [inviteCodes, searchTerm]);

  // Early return checks after all hooks
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Trebuie să fiți autentificat pentru a accesa această pagină.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user.permissions?.includes("invite_codes:read:all")) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Nu aveți permisiunea să accesați această pagină. Doar
              administratorii pot gestiona codurile de invitație.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Codul a fost copiat în clipboard!");
    } catch (_error) {
      toast.error("Nu s-a putut copia codul");
    }
  };

  const onCancelCode = async (codeId: string) => {
    try {
      await cancelInviteCode.mutateAsync(codeId);
      toast.success("Codul a fost anulat cu succes!");
    } catch (_error) {
      toast.error("Nu s-a putut anula codul");
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              A apărut o eroare la încărcarea codurilor de invitație.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Coduri de Invitație</h1>
          <p className="text-muted-foreground">
            Gestionează codurile de invitație pentru apartamente
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generează Cod
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Coduri</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.used}</div>
            <p className="text-xs text-muted-foreground">Folosite</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {stats.expired}
            </div>
            <p className="text-xs text-muted-foreground">Expirate</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="search">Caută coduri</Label>
            <Input
              id="search"
              placeholder="Caută după cod, număr apartament sau clădire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invite Codes List */}
      <Card>
        <CardHeader>
          <CardTitle>Coduri de Invitație ({filteredCodes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Se încarcă codurile...</p>
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Nu s-au găsit coduri pentru căutarea ta."
                  : "Nu există coduri de invitație."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCodes.map((inviteCode) => {
                const statusInfo = statusConfig[inviteCode.status];
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={inviteCode.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                          {inviteCode.code}
                        </code>
                        <Badge variant={statusInfo.variant}>
                          <StatusIcon
                            className={`h-3 w-3 mr-1 ${statusInfo.color}`}
                          />
                          {statusInfo.label}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium">Apartament:</span>{" "}
                          {inviteCode.apartment.number} -{" "}
                          {inviteCode.apartment.building.name}
                        </p>
                        <p>
                          <span className="font-medium">Creat:</span>{" "}
                          {formatDistanceToNow(new Date(inviteCode.createdAt), {
                            addSuffix: true,
                            locale: ro,
                          })}
                        </p>
                        {inviteCode.expiresAt && (
                          <p>
                            <span className="font-medium">Expiră:</span>{" "}
                            {formatDistanceToNow(
                              new Date(inviteCode.expiresAt),
                              { addSuffix: true, locale: ro }
                            )}
                          </p>
                        )}
                        {inviteCode.usedByUser && (
                          <p>
                            <span className="font-medium">Folosit de:</span>{" "}
                            {inviteCode.usedByUser.firstName}{" "}
                            {inviteCode.usedByUser.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCopyCode(inviteCode.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      {inviteCode.status === InviteCodeStatus.ACTIVE && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCancelCode(inviteCode.id)}
                          disabled={cancelInviteCode.isPending}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <CreateInviteCodeModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}
