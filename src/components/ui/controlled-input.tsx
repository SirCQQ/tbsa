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
import { FormInput, type FormInputProps } from "./form-input";

interface ControlledInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<
    FormInputProps,
    "name" | "value" | "onChange" | "onBlur" | "errors"
  > {
  name: TName;
  control?: Control<TFieldValues>;
  defaultValue?: PathValue<TFieldValues, TName>;
  rules?: Parameters<typeof Controller<TFieldValues, TName>>[0]["rules"];
  errors?: FieldErrors<TFieldValues>;
}

function ControlledInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  defaultValue,
  rules,
  errors,
  ...formInputProps
}: ControlledInputProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>();
  const formControl = control || formContext?.control;
  const formErrors = errors || formContext?.formState?.errors;

  if (!formControl) {
    throw new Error(
      "ControlledInput must be used within a FormProvider or have control prop provided"
    );
  }

  return (
    <Controller
      name={name}
      control={formControl}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field, fieldState }) => (
        <FormInput
          {...formInputProps}
          {...field}
          name={name}
          errors={formErrors}
          hasError={!!fieldState.error}
        />
      )}
    />
  );
}

export { ControlledInput, type ControlledInputProps };
