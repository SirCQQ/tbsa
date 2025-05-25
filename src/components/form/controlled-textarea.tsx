import * as React from "react";
import {
  Controller,
  useFormContext,
  type Control,
  type FieldPath,
  type FieldValues,
  type PathValue,
  type FieldErrors,
} from "react-hook-form";
import { FormTextarea, type FormTextareaProps } from "./form-textarea";

interface ControlledTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<
    FormTextareaProps,
    "name" | "value" | "onChange" | "onBlur" | "errors"
  > {
  name: TName;
  control?: Control<TFieldValues>;
  defaultValue?: PathValue<TFieldValues, TName>;
  rules?: Parameters<typeof Controller<TFieldValues, TName>>[0]["rules"];
  errors?: FieldErrors<TFieldValues>;
}

function ControlledTextarea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  defaultValue,
  rules,
  errors,
  ...formTextareaProps
}: ControlledTextareaProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>();
  const formControl = control || formContext?.control;
  const formErrors = errors || formContext?.formState?.errors;

  if (!formControl) {
    throw new Error(
      "ControlledTextarea must be used within a FormProvider or have control prop provided"
    );
  }

  return (
    <Controller
      name={name}
      control={formControl}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field, fieldState }) => (
        <FormTextarea
          {...formTextareaProps}
          {...field}
          name={name}
          errors={formErrors}
          hasError={!!fieldState.error}
        />
      )}
    />
  );
}

export { ControlledTextarea, type ControlledTextareaProps };
