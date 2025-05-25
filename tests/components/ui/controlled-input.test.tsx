import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm, FormProvider } from "react-hook-form";
import { ControlledInput } from "@/components/ui/controlled-input";

// Test wrapper component
type TestFormData = {
  testField: string;
  email: string;
  required: string;
};

function TestWrapper({
  children,
  defaultValues = { testField: "", email: "", required: "" },
}: {
  children: React.ReactNode;
  defaultValues?: Partial<TestFormData>;
}) {
  const methods = useForm<TestFormData>({
    defaultValues,
    mode: "onChange",
  });

  return (
    <FormProvider {...methods}>
      <form>{children}</form>
    </FormProvider>
  );
}

describe("ControlledInput", () => {
  // Basic rendering tests
  it("renders controlled input with label", () => {
    render(
      <TestWrapper>
        <ControlledInput name="testField" label="Test Label" />
      </TestWrapper>
    );

    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders with default value", () => {
    render(
      <TestWrapper defaultValues={{ testField: "Default value" }}>
        <ControlledInput name="testField" label="Test" />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue("Default value")).toBeInTheDocument();
  });

  it("throws error when used without FormProvider or control prop", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<ControlledInput name="testField" label="Test" />);
    }).toThrow(
      "ControlledInput must be used within a FormProvider or have control prop provided"
    );

    consoleSpy.mockRestore();
  });

  // Form integration tests
  it("updates form state when user types", async () => {
    const user = userEvent.setup();
    let formData: TestFormData | null = null;

    function TestComponent() {
      const methods = useForm<TestFormData>({
        defaultValues: { testField: "", email: "", required: "" },
      });

      return (
        <FormProvider {...methods}>
          <form>
            <ControlledInput name="testField" label="Test Field" />
            <button
              type="button"
              onClick={() => {
                formData = methods.getValues();
              }}
            >
              Get Values
            </button>
          </form>
        </FormProvider>
      );
    }

    render(<TestComponent />);

    const input = screen.getByRole("textbox");
    await user.type(input, "Hello world");

    const button = screen.getByText("Get Values");
    await user.click(button);
    //@ts-expect-error form data in never
    expect(formData?.testField).toBe("Hello world");
  });

  it("shows validation errors", async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const methods = useForm<TestFormData>({
        defaultValues: { testField: "", email: "", required: "" },
        mode: "onChange",
      });
      methods.trigger();
      return (
        <FormProvider {...methods}>
          <form>
            <ControlledInput
              name="required"
              label="Required Field"
              rules={{ required: "This field is required" }}
            />
          </form>
        </FormProvider>
      );
    }

    render(<TestComponent />);

    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.tab(); // Trigger blur to show validation error

    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("applies error styling when field has error", async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const methods = useForm<TestFormData>({
        defaultValues: { testField: "", email: "", required: "" },
        mode: "onChange",
      });

      return (
        <FormProvider {...methods}>
          <form>
            <ControlledInput
              name="email"
              label="Email"
              type="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email",
                },
              }}
            />
          </form>
        </FormProvider>
      );
    }

    render(<TestComponent />);

    const input = screen.getByRole("textbox");
    await user.type(input, "invalid-email");
    await user.tab();

    expect(input).toHaveClass("border-red-500");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("validates minimum length", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ControlledInput
          name="testField"
          label="Min Length Field"
          rules={{
            minLength: {
              value: 5,
              message: "Minimum 5 characters required",
            },
          }}
        />
      </TestWrapper>
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "abc");
    await user.tab();

    expect(
      screen.getByText("Minimum 5 characters required")
    ).toBeInTheDocument();
  });

  it("validates with custom validation function", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ControlledInput
          name="testField"
          label="Custom Validation"
          rules={{
            validate: (value) =>
              value !== "forbidden" || "This value is not allowed",
          }}
        />
      </TestWrapper>
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "forbidden");
    await user.tab();

    expect(screen.getByText("This value is not allowed")).toBeInTheDocument();
  });

  // Different input types
  it("handles email input type", () => {
    render(
      <TestWrapper>
        <ControlledInput name="email" label="Email" type="email" />
      </TestWrapper>
    );

    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
  });

  it("handles password input type", () => {
    render(
      <TestWrapper>
        <ControlledInput name="testField" label="Password" type="password" />
      </TestWrapper>
    );

    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password"
    );
  });

  // Props forwarding tests
  it("forwards placeholder prop", () => {
    render(
      <TestWrapper>
        <ControlledInput
          name="testField"
          label="Test"
          placeholder="Enter text here"
        />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText("Enter text here")).toBeInTheDocument();
  });

  it("forwards disabled prop", () => {
    render(
      <TestWrapper>
        <ControlledInput name="testField" label="Disabled Field" disabled />
      </TestWrapper>
    );

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("forwards required prop to FormInput", () => {
    render(
      <TestWrapper>
        <ControlledInput name="testField" label="Required Field" required />
      </TestWrapper>
    );

    expect(screen.getByLabelText("required")).toBeInTheDocument();
  });

  it("forwards helperText prop", () => {
    render(
      <TestWrapper>
        <ControlledInput
          name="testField"
          label="Test"
          helperText="This is helper text"
        />
      </TestWrapper>
    );

    expect(screen.getByText("This is helper text")).toBeInTheDocument();
  });

  // External control prop test
  it("works with external control prop", async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { control, getValues } = useForm<TestFormData>({
        defaultValues: { testField: "", email: "", required: "" },
      });

      return (
        <div>
          <ControlledInput
            name="testField"
            label="External Control"
            control={control}
          />
          <button
            onClick={() => {
              const values = getValues();
              document.body.setAttribute("data-testid", values.testField);
            }}
          >
            Get Value
          </button>
        </div>
      );
    }

    render(<TestComponent />);

    const input = screen.getByRole("textbox");
    await user.type(input, "test value");

    const button = screen.getByText("Get Value");
    await user.click(button);

    expect(document.body).toHaveAttribute("data-testid", "test value");
  });

  // Accessibility tests
  it("maintains accessibility attributes", () => {
    render(
      <TestWrapper>
        <ControlledInput
          name="testField"
          label="Accessible Field"
          required
          helperText="Helper text"
        />
      </TestWrapper>
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAccessibleName("Accessible Field required");
  });

  // Form reset test
  it("resets value when form is reset", async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const methods = useForm<TestFormData>({
        defaultValues: { testField: "initial", email: "", required: "" },
      });

      return (
        <FormProvider {...methods}>
          <form>
            <ControlledInput name="testField" label="Test Field" />
            <button
              type="button"
              onClick={() =>
                methods.reset({
                  testField: "reset value",
                  email: "",
                  required: "",
                })
              }
            >
              Reset
            </button>
          </form>
        </FormProvider>
      );
    }

    render(<TestComponent />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("initial");

    await user.clear(input);
    await user.type(input, "changed value");
    expect(input).toHaveValue("changed value");

    const resetButton = screen.getByText("Reset");
    await user.click(resetButton);

    expect(input).toHaveValue("reset value");
  });
});
