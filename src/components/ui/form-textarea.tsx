import * as React from "react";
import { Textarea } from "./textarea";
import { FormErrorMessage } from "./form-error-message";
import { type FieldErrors, type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

interface FormTextareaProps extends React.ComponentProps<"textarea"> {
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

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
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
    const textareaId = id || generatedId;

    // Determine if we have an error (either explicit prop, custom error, or from form state)
    const hasErrorState =
      hasError !== undefined
        ? hasError
        : error || (name && errors && errors[name]);

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
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

        <Textarea
          ref={ref}
          id={textareaId}
          name={name}
          className={cn(
            hasErrorState &&
              "border-red-500 focus-visible:ring-red-500 dark:border-red-500",
            className
          )}
          aria-invalid={hasErrorState ? "true" : "false"}
          aria-describedby={
            hasErrorState
              ? `${textareaId}-error`
              : helperText
              ? `${textareaId}-helper`
              : undefined
          }
          {...props}
        />

        {/* Error message - prioritize custom error over form errors */}
        {hasErrorState && (
          <FormErrorMessage
            id={`${textareaId}-error`}
            message={error}
            name={!error ? name : undefined}
            errors={!error ? errors : undefined}
          />
        )}

        {helperText && !hasErrorState && (
          <p
            id={`${textareaId}-helper`}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";

export { FormTextarea, type FormTextareaProps };
