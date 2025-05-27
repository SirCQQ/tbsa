import * as React from "react";
import { Input } from "@/components/ui/input";
import { FormFieldWrapper } from "./form-field-wrapper";

interface FormInputProps extends React.ComponentProps<typeof Input> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  required?: boolean;
}

const FormInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  FormInputProps
>(({ label, helperText, required = false, ...inputProps }, ref) => {
  return (
    <FormFieldWrapper label={label} helperText={helperText} required={required}>
      <Input ref={ref} {...inputProps} />
    </FormFieldWrapper>
  );
});

FormInput.displayName = "FormInput";

export { FormInput, type FormInputProps };
