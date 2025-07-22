"use client";

import * as React from "react";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { FormFieldWrapper } from "./form-field-wrapper";
import { PasswordInput, PasswordInputProps } from "../password-input";

interface FormPasswordInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<PasswordInputProps, "name"> {
  name: TName;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  required?: boolean;
}

export function FormPasswordInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  helperText,
  required,
  ...passwordInputProps
}: FormPasswordInputProps<TFieldValues, TName>) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormFieldWrapper
          label={label}
          helperText={helperText}
          required={required}
        >
          <PasswordInput {...passwordInputProps} {...field} />
        </FormFieldWrapper>
      )}
    />
  );
}
