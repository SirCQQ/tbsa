import * as React from "react";
import {
  type FieldPath,
  type FieldValues,
  type PathValue,
  type ControllerProps,
} from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { FormCheckbox } from "../form-checkbox";

interface ControlledCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<
    React.ComponentProps<typeof FormCheckbox>,
    "name" | "checked" | "onCheckedChange"
  > {
  name: TName;
  defaultValue?: PathValue<TFieldValues, TName>;
  rules?: ControllerProps<TFieldValues, TName>["rules"];
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  required?: boolean;
}

function ControlledCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  defaultValue,
  rules,
  ...formCheckboxProps
}: ControlledCheckboxProps<TFieldValues, TName>) {
  return (
    <FormField
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field }) => (
        <FormCheckbox
          checked={field.value}
          onCheckedChange={field.onChange}
          {...formCheckboxProps}
        />
      )}
    />
  );
}

export { ControlledCheckbox, type ControlledCheckboxProps };
