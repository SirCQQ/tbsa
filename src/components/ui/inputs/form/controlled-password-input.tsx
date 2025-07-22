"use client";

import * as React from "react";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormPasswordInput } from "../form-password-input";
import { PasswordInputProps } from "../../password-input";

interface ControlledPasswordInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<PasswordInputProps, "name"> {
  name: TName;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  required?: boolean;
}

export function ControlledPasswordInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControlledPasswordInputProps<TFieldValues, TName>) {
  return <FormPasswordInput {...props} />;
}
