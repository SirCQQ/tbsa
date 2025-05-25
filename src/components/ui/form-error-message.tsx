import * as React from "react";
import { ErrorMessage } from "@hookform/error-message";
import { type FieldErrors, type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

interface FormErrorMessageProps extends React.ComponentProps<"p"> {
  // For form field errors
  name?: string;
  errors?: FieldErrors<FieldValues>;

  // For custom error messages
  message?: string;

  // Custom render function
  render?: (props: { message: string }) => React.ReactNode;
}

const FormErrorMessage: React.FC<FormErrorMessageProps> = ({
  name,
  errors,
  message,
  className,
  render,
  ...pProps
}) => {
  // Default render function
  const defaultRender = ({ message }: { message: string }) => (
    <p
      className={cn("text-sm text-red-600 dark:text-red-400", className)}
      role="alert"
      {...pProps}
    >
      {message}
    </p>
  );

  const renderFunction = render || defaultRender;

  // Check if we have a valid custom message (not empty or whitespace only)
  if (message && message.trim().length > 0) {
    return renderFunction({ message });
  }

  // Check if we have valid form errors and a field name
  if (name && errors && typeof errors === "object") {
    // Check if the specific field has an error
    const fieldError = errors[name];
    if (fieldError && fieldError.message) {
      return (
        <ErrorMessage errors={errors} name={name} render={renderFunction} />
      );
    }
  }

  // No valid error to display
  return null;
};

FormErrorMessage.displayName = "FormErrorMessage";

export { FormErrorMessage, type FormErrorMessageProps };
