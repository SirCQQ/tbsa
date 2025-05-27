"use client";

import { useState } from "react";
import { Plus, Copy, Ban, CheckCircle, Clock, XCircle } from "lucide-react";
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

const statusConfig = {
  ACTIVE: {
    label: "Activ",
    icon: CheckCircle,
    variant: "default" as const,
    color: "text-green-600",
  },
  USED: {
    label: "Folosit",
    icon: CheckCircle,
    variant: "secondary" as const,
    color: "text-blue-600",
  },
  EXPIRED: {
    label: "Expirat",
    icon: Clock,
    variant: "destructive" as const,
    color: "text-orange-600",
  },
  CANCELLED: {
    label: "Anulat",
    icon: XCircle,
    variant: "outline" as const,
    color: "text-red-600",
  },
};

export function AdminInviteCodesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    data: inviteCodes,
    isLoading,
    error,
  } = useInviteCodes("admin-id-placeholder");
  const cancelInviteCode = useCancelInviteCode();

  const { data: apartmentsResponse } = useApartments();
  const apartments = apartmentsResponse?.data?.apartments || [];

  const filteredCodes =
    inviteCodes?.filter(
      (code) =>
        code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.apartment.number
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        code.apartment.building.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    ) || [];

  const stats = {
    total: inviteCodes?.length || 0,
    active:
      inviteCodes?.filter((code) => code.status === InviteCodeStatus.ACTIVE)
        .length || 0,
    used:
      inviteCodes?.filter((code) => code.status === InviteCodeStatus.USED)
        .length || 0,
    expired:
      inviteCodes?.filter((code) => code.status === InviteCodeStatus.EXPIRED)
        .length || 0,
  };

  const onCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Cod copiat în clipboard!");
    } catch (error) {
      toast.error("Nu s-a putut copia codul");
    }
  };

  const onCancelCode = async (codeId: string) => {
    try {
      await cancelInviteCode.mutateAsync({
        codeId,
        administratorId: "admin-id-placeholder",
      });
      toast.success("Codul a fost anulat cu succes!");
    } catch (error) {
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
