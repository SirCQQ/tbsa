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
  render?: (props: { children: React.ReactNode }) => React.ReactNode;
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
  const defaultRender = ({ children }: { children: React.ReactNode }) => (
    <p
      className={cn("text-sm text-red-600 dark:text-red-400", className)}
      role="alert"
      {...pProps}
    >
      {children}
    </p>
  );

  const renderFunction = render || defaultRender;

  // Check if we have a valid custom message (not empty or whitespace only)
  if (message && message.trim().length > 0) {
    return renderFunction({ children: message });
  }

  // Check if we have valid form errors and a field name
  if (name && errors && typeof errors === "object") {
    return (
      <ErrorMessage
        name={name}
        as={
          <p
            role="alert"
            className={cn("text-sm text-red-600 dark:text-red-400", className)}
            {...pProps}
          />
        }
      />
    );
  }

  // No valid error to display
  return null;
};

FormErrorMessage.displayName = "FormErrorMessage";

export { FormErrorMessage, type FormErrorMessageProps };
