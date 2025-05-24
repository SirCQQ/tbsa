import * as React from "react";
import { Input } from "./input";
import { FormErrorMessage } from "./form-error-message";
import { type FieldErrors, type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  labelClassName?: string;
  containerClassName?: string;

  // For react-hook-form integration
  name?: string;
  errors?: FieldErrors<FieldValues>;

  // Explicit error state
  hasError?: boolean;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      required = false,
      helperText,
      labelClassName,
      containerClassName,
      className,
      id,
      name,
      errors,
      hasError,
      ...props
    },
    ref
  ) => {
    // Generate a unique id if not provided - use React.useId() unconditionally
    const generatedId = React.useId();
    const inputId = id || generatedId;

    // Determine if we have an error (either explicit prop, custom error, or from form state)
    const hasErrorState =
      hasError !== undefined
        ? hasError
        : error || (name && errors && errors[name]);

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium text-gray-700 dark:text-gray-300",
              hasErrorState && "text-red-700 dark:text-red-400",
              labelClassName
            )}
          >
            {label}
            {required && (
              <span className="ml-1 text-red-500" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <Input
          ref={ref}
          id={inputId}
          name={name}
          className={cn(
            hasErrorState &&
              "border-red-500 focus-visible:ring-red-500 dark:border-red-500",
            className
          )}
          aria-invalid={hasErrorState ? "true" : "false"}
          aria-describedby={
            hasErrorState
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          {...props}
        />

        {/* Error message - prioritize custom error over form errors */}
        {hasErrorState && (
          <FormErrorMessage
            id={`${inputId}-error`}
            message={error}
            name={!error ? name : undefined}
            errors={!error ? errors : undefined}
          />
        )}

        {helperText && !hasErrorState && (
          <p
            id={`${inputId}-helper`}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export { FormInput, type FormInputProps };
