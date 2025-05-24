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

  // If we have a custom message, display it directly
  if (message) {
    return renderFunction({ message });
  }

  // If we have form errors and a field name, use ErrorMessage from react-hook-form
  if (name && errors) {
    return <ErrorMessage errors={errors} name={name} render={renderFunction} />;
  }

  // No error to display
  return null;
};

FormErrorMessage.displayName = "FormErrorMessage";

export { FormErrorMessage, type FormErrorMessageProps };
