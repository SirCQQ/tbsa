import * as React from "react";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

interface FormCheckboxProps extends React.ComponentProps<typeof Checkbox> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  required?: boolean;
}

const FormCheckbox = React.forwardRef<
  React.ElementRef<typeof Checkbox>,
  FormCheckboxProps
>(({ label, helperText, required = false, ...checkboxProps }, ref) => {
  return (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
      <FormControl>
        <Checkbox ref={ref} {...checkboxProps} />
      </FormControl>
      <div className="space-y-1 leading-none">
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
        {helperText && <FormDescription>{helperText}</FormDescription>}
      </div>
      <FormMessage />
    </FormItem>
  );
});

FormCheckbox.displayName = "FormCheckbox";

export { FormCheckbox, type FormCheckboxProps };
