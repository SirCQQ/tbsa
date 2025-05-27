import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm, FormProvider } from "react-hook-form";
import { ControlledInput } from "@/components/ui/inputs/form/controlled-input";
import { useEffect } from "react";

// Test wrapper component
type TestFormData = {
  testField: string;
  email: string;
  required: string;
};

const TestWrapper = ({
  children,
  defaultValues = {},
}: {
  children: React.ReactNode;
  defaultValues?: Partial<TestFormData>;
}) => {
  const methods = useForm<TestFormData>({
    defaultValues: {
      testField: "",
      email: "",
      required: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("ControlledInput", () => {
  // Basic rendering tests
  it("renders input with label", () => {
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
      <TestWrapper defaultValues={{ testField: "default value" }}>
        <ControlledInput name="testField" label="Test" />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue("default value")).toBeInTheDocument();
  });

  it("throws error when used without FormProvider", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<ControlledInput name="testField" label="Test" />);
    }).toThrow();

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

  it("displays validation errors", async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const methods = useForm<TestFormData>({
        defaultValues: { testField: "", email: "", required: "" },
        mode: "onBlur",
      });

      return (
        <FormProvider {...methods}>
          <form>
            <ControlledInput
              name="required"
              label="Test"
              rules={{ required: "This field is required" }}
            />
          </form>
        </FormProvider>
      );
    }

    render(<TestComponent />);

    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.tab();

    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(
      <TestWrapper>
        <ControlledInput name="testField" label="Test" required />
      </TestWrapper>
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("name", "testField");
  });

  it("associates error message with input", () => {
    function TestComponent() {
      const methods = useForm<TestFormData>({
        defaultValues: { testField: "", email: "", required: "" },
        mode: "onChange",
      });

      // Set an error manually
      useEffect(() => {
        methods.setError("testField", { message: "Error message" });
      }, [methods]);

      return (
        <FormProvider {...methods}>
          <ControlledInput name="testField" label="Test" id="test-field" />
        </FormProvider>
      );
    }

    render(<TestComponent />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });
});
