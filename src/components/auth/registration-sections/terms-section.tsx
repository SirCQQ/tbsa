import Link from "next/link";
import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import type { UserRegistrationData } from "@/lib/validations/auth";

type TermsSectionProps = {
  form: UseFormReturn<UserRegistrationData>;
  isLoading?: boolean;
};

export function TermsSection({ form, isLoading }: TermsSectionProps) {
  return (
    <div className="flex flex-row items-start space-x-3 space-y-0">
      <Checkbox
        checked={form.watch("agreeToTerms")}
        onCheckedChange={(checked) => form.setValue("agreeToTerms", !!checked)}
        className="hover:cursor-pointer"
        disabled={isLoading}
      />
      <div className="space-y-1 leading-none">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Accept{" "}
          <Link
            href="/terms"
            className="text-primary hover:underline"
            target="_blank"
          >
            termenii și condițiile
          </Link>{" "}
          și{" "}
          <Link
            href="/privacy"
            className="text-primary hover:underline"
            target="_blank"
          >
            politica de confidențialitate
          </Link>
          *
        </label>
        {form.formState.errors.agreeToTerms && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.agreeToTerms.message}
          </p>
        )}
      </div>
    </div>
  );
}
