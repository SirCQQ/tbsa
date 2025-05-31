import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertCircle, Lock } from "lucide-react";

type AccessDeniedProps = {
  title?: string;
  message?: string;
  icon?: "shield" | "alert" | "lock";
  variant?: "card" | "inline";
  className?: string;
};

export function AccessDenied({
  title = "Acces interzis",
  message = "Nu aveți permisiunea să accesați această secțiune.",
  icon = "shield",
  variant = "card",
  className = "",
}: AccessDeniedProps) {
  const IconComponent = {
    shield: Shield,
    alert: AlertCircle,
    lock: Lock,
  }[icon];

  const content = (
    <div className={`text-center py-8 ${className}`}>
      <IconComponent className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  if (variant === "inline") {
    return content;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardContent>{content}</CardContent>
      </Card>
    </div>
  );
}
