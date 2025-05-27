import { ControlledSelect, SelectItem } from "@/components/ui/inputs";
import * as React from "react";
import { FormProvider, useForm } from "react-hook-form";

// Example usage of ControlledSelect
interface FormData {
  category: string;
  priority: string;
}

export function ExampleSelectForm() {
  const methods = useForm<FormData>({
    defaultValues: {
      category: "",
      priority: "medium",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <ControlledSelect
          name="category"
          label="Category"
          placeholder="Select a category"
          helperText="Choose the appropriate category for your item"
          required
        >
          <SelectItem value="electronics">Electronics</SelectItem>
          <SelectItem value="clothing">Clothing</SelectItem>
          <SelectItem value="books">Books</SelectItem>
          <SelectItem value="home">Home & Garden</SelectItem>
        </ControlledSelect>

        <ControlledSelect
          name="priority"
          label="Priority Level"
          placeholder="Select priority"
          helperText="Set the priority level for this task"
        >
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </ControlledSelect>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Submit
        </button>
      </form>
    </FormProvider>
  );
}
