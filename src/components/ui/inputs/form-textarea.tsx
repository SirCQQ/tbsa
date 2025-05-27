import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { FormFieldWrapper } from "./form-field-wrapper";

interface FormTextareaProps extends React.ComponentProps<typeof Textarea> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  required?: boolean;
}

const FormTextarea = React.forwardRef<
  React.ElementRef<typeof Textarea>,
  FormTextareaProps
>(({ label, helperText, required = false, ...textareaProps }, ref) => {
  return (
    <FormFieldWrapper label={label} helperText={helperText} required={required}>
      <Textarea ref={ref} {...textareaProps} />
    </FormFieldWrapper>
  );
});

FormTextarea.displayName = "FormTextarea";

export { FormTextarea, type FormTextareaProps };
