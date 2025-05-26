import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SafeUser } from "@/types/auth";

type AccountSummaryCardProps = {
  user: SafeUser;
};

export function AccountSummaryCard({ user }: AccountSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rezumat Cont</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Membru din</p>
          <p className="text-sm text-muted-foreground">
            {new Date(user.createdAt).toLocaleDateString("ro-RO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Status</p>
          <Badge variant="outline" className="text-green-600 border-green-200">
            Activ
          </Badge>
        </div>
        {user.owner && user.owner.apartments && (
          <div>
            <p className="text-sm font-medium">Apartamente</p>
            <p className="text-sm text-muted-foreground">
              {user.owner.apartments.length} apartament
              {user.owner.apartments.length !== 1 ? "e" : ""}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
