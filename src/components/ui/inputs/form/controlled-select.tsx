import * as React from "react";
import {
  type FieldPath,
  type FieldValues,
  type PathValue,
  type ControllerProps,
} from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { FormSelect, type FormSelectProps } from "../form-select";

interface ControlledSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<FormSelectProps, "name" | "value" | "onValueChange"> {
  name: TName;
  defaultValue?: PathValue<TFieldValues, TName>;
  rules?: ControllerProps<TFieldValues, TName>["rules"];
}

function ControlledSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  defaultValue,
  rules,
  ...formSelectProps
}: ControlledSelectProps<TFieldValues, TName>) {
  return (
    <FormField
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field }) => (
        <FormSelect
          value={field.value}
          onValueChange={field.onChange}
          {...formSelectProps}
        />
      )}
    />
  );
}

export { ControlledSelect, type ControlledSelectProps };
