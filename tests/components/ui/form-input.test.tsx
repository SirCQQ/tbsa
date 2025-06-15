import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormInput } from "@/components/ui/inputs/form-input";
import { useForm, FormProvider } from "react-hook-form";

// Test wrapper component that provides form context
function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
}

// Helper function to render with form context
function renderWithForm(ui: React.ReactElement) {
  return render(<TestWrapper>{ui}</TestWrapper>);
}

describe("FormInput", () => {
  // Basic rendering tests
  it("renders input with label", () => {
    renderWithForm(<FormInput label="Test Label" />);

    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders without label", () => {
    renderWithForm(<FormInput placeholder="Enter text" />);

    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("uses provided id", () => {
    renderWithForm(<FormInput label="Test Label" id="custom-id" />);

    const input = screen.getByRole("textbox");
    expect(input.id).toBe("custom-id");
  });

  // Required field tests
  it("shows required asterisk when required", () => {
    renderWithForm(<FormInput label="Required Field" required />);

    expect(screen.getByLabelText("required")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("does not show asterisk when not required", () => {
    renderWithForm(<FormInput label="Optional Field" />);

    expect(screen.queryByLabelText("required")).not.toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  // Helper text tests
  it("displays helper text when provided", () => {
    renderWithForm(<FormInput label="Test" helperText="This is helper text" />);

    expect(screen.getByText("This is helper text")).toBeInTheDocument();
  });

  // User interaction tests
  it("handles user input", async () => {
    const user = userEvent.setup();
    renderWithForm(<FormInput label="Test" />);

    const input = screen.getByRole("textbox");
    await user.type(input, "Hello world");

    expect(input).toHaveValue("Hello world");
  });

  it("handles focus and blur-sm events", async () => {
    const user = userEvent.setup();
    const onFocus = jest.fn();
    const onBlur = jest.fn();

    renderWithForm(
      <FormInput label="Test" onFocus={onFocus} onBlur={onBlur} />
    );

    const input = screen.getByRole("textbox");
    await user.click(input);
    expect(onFocus).toHaveBeenCalled();

    await user.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  // Input types tests
  it("renders different input types correctly", () => {
    const { rerender } = render(
      <TestWrapper>
        <FormInput type="email" />
      </TestWrapper>
    );
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

    rerender(
      <TestWrapper>
        <FormInput type="password" />
      </TestWrapper>
    );
    expect(screen.getByDisplayValue("")).toHaveAttribute("type", "password");

    rerender(
      <TestWrapper>
        <FormInput type="number" />
      </TestWrapper>
    );
    expect(screen.getByRole("spinbutton")).toHaveAttribute("type", "number");
  });

  // Forwarded ref test
  it("forwards ref to input element", () => {
    const ref = jest.fn();
    renderWithForm(<FormInput label="Test" ref={ref} />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  // Name attribute test
  it("passes name attribute to input", () => {
    renderWithForm(<FormInput label="Test" name="testField" />);

    expect(screen.getByRole("textbox")).toHaveAttribute("name", "testField");
  });
});
