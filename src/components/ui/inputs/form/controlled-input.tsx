import * as React from "react";
import {
  type FieldPath,
  type FieldValues,
  type PathValue,
  type ControllerProps,
} from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { FormInput, type FormInputProps } from "../form-input";

interface ControlledInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<FormInputProps, "name"> {
  name: TName;
  defaultValue?: PathValue<TFieldValues, TName>;
  rules?: ControllerProps<TFieldValues, TName>["rules"];
}

function ControlledInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  defaultValue,
  rules,
  ...formInputProps
}: ControlledInputProps<TFieldValues, TName>) {
  return (
    <FormField
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field }) => <FormInput {...field} {...formInputProps} />}
    />
  );
}

export { ControlledInput, type ControlledInputProps };
