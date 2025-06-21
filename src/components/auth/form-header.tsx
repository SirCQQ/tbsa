import { cn } from "@/lib/utils";

type FormHeaderProps = {
  title?: string;
  description: string;
  className?: string;
};

export function FormHeader({ title, description, className }: FormHeaderProps) {
  return (
    <div className={cn("text-center space-y-2 mb-6", className)}>
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
