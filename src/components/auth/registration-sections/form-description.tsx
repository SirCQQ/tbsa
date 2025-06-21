type FormDescriptionProps = {
  description: string;
};

export function FormDescription({ description }: FormDescriptionProps) {
  return (
    <div className="text-center space-y-2 mb-6">
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
