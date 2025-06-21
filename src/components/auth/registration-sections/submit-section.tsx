import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SubmitSectionProps = {
  isLoading: boolean;
  buttonText?: string;
  loadingText?: string;
};

export function SubmitSection({
  isLoading,
  buttonText = "Înregistrează-te",
  loadingText = "Se procesează...",
}: SubmitSectionProps) {
  return (
    <Button
      type="submit"
      className="w-full"
      disabled={isLoading}
      borderRadius="full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
}
