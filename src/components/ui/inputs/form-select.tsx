import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormFieldWrapper } from "./form-field-wrapper";

interface FormSelectProps extends React.ComponentProps<typeof Select> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  required?: boolean;
  placeholder?: string;
  children: React.ReactNode;
}

const FormSelect = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  FormSelectProps
>(
  (
    {
      label,
      helperText,
      required = false,
      placeholder,
      children,
      ...selectProps
    },
    ref
  ) => {
    return (
      <FormFieldWrapper
        label={label}
        helperText={helperText}
        required={required}
      >
        <Select {...selectProps}>
          <SelectTrigger ref={ref}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>{children}</SelectContent>
        </Select>
      </FormFieldWrapper>
    );
  }
);

FormSelect.displayName = "FormSelect";

export { FormSelect, type FormSelectProps, SelectItem };
