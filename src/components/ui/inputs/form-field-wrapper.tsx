import * as React from "react";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface FormFieldWrapperProps extends React.ComponentProps<typeof FormItem> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}

export function FormFieldWrapper({
  label,
  helperText,
  required = false,
  children,
  className,
  ...formItemProps
}: FormFieldWrapperProps) {
  return (
    <FormItem className={className} {...formItemProps}>
      {label && (
        <FormLabel>
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-label="required">
              *
            </span>
          )}
        </FormLabel>
      )}
      <FormControl>{children}</FormControl>
      {helperText && <FormDescription>{helperText}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}
