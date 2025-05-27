import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormTextarea } from "@/components/ui/inputs/form-textarea";
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

describe("FormTextarea", () => {
  // Basic rendering tests
  it("renders textarea with label", () => {
    renderWithForm(<FormTextarea label="Test Label" />);

    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders without label", () => {
    renderWithForm(<FormTextarea placeholder="Enter text" />);

    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("uses provided id", () => {
    renderWithForm(<FormTextarea label="Test Label" id="custom-id" />);

    const textarea = screen.getByRole("textbox");
    expect(textarea.id).toBe("custom-id");
  });

  // Required field tests
  it("shows required asterisk when required", () => {
    renderWithForm(<FormTextarea label="Required Field" required />);

    expect(screen.getByLabelText("required")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("does not show asterisk when not required", () => {
    renderWithForm(<FormTextarea label="Optional Field" />);

    expect(screen.queryByLabelText("required")).not.toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  // Helper text tests
  it("displays helper text when provided", () => {
    renderWithForm(
      <FormTextarea label="Test" helperText="This is helper text" />
    );

    expect(screen.getByText("This is helper text")).toBeInTheDocument();
  });

  // User interaction tests
  it("handles user input", async () => {
    const user = userEvent.setup();
    renderWithForm(<FormTextarea label="Test" />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Hello world\nMultiple lines");

    expect(textarea).toHaveValue("Hello world\nMultiple lines");
  });

  it("handles focus and blur events", async () => {
    const user = userEvent.setup();
    const onFocus = jest.fn();
    const onBlur = jest.fn();

    renderWithForm(
      <FormTextarea label="Test" onFocus={onFocus} onBlur={onBlur} />
    );

    const textarea = screen.getByRole("textbox");
    await user.click(textarea);
    expect(onFocus).toHaveBeenCalled();

    await user.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  // Textarea specific props
  it("renders with custom rows", () => {
    renderWithForm(<FormTextarea label="Test" rows={10} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "10");
  });

  it("renders with custom cols", () => {
    renderWithForm(<FormTextarea label="Test" cols={50} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("cols", "50");
  });

  it("handles resize attribute", () => {
    renderWithForm(
      <FormTextarea label="Test" style={{ resize: "vertical" }} />
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveStyle("resize: vertical");
  });

  // Forwarded ref test
  it("forwards ref to textarea element", () => {
    const ref = jest.fn();
    renderWithForm(<FormTextarea label="Test" ref={ref} />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
  });

  // Name attribute test
  it("passes name attribute to textarea", () => {
    renderWithForm(<FormTextarea label="Test" name="testField" />);

    expect(screen.getByRole("textbox")).toHaveAttribute("name", "testField");
  });
});
