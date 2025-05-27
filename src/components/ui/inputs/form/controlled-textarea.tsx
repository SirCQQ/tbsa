import * as React from "react";
import {
  type FieldPath,
  type FieldValues,
  type PathValue,
  type ControllerProps,
} from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { FormTextarea, type FormTextareaProps } from "../form-textarea";

interface ControlledTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<FormTextareaProps, "name"> {
  name: TName;

  defaultValue?: PathValue<TFieldValues, TName>;
  rules?: ControllerProps<TFieldValues, TName>["rules"];
}

function ControlledTextarea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  defaultValue,
  rules,
  ...formTextareaProps
}: ControlledTextareaProps<TFieldValues, TName>) {
  return (
    <FormField
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field }) => <FormTextarea {...field} {...formTextareaProps} />}
    />
  );
}

export { ControlledTextarea, type ControlledTextareaProps };
