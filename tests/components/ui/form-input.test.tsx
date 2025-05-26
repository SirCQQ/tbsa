import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormInput } from "@/components/form/form-input";
import { TestContext } from "node:test";

describe("FormInput", () => {
  // Basic rendering tests
  it("renders input with label", () => {
    render(<FormInput label="Test Label" />);

    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders without label", () => {
    render(<FormInput placeholder="Enter text" />);

    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    expect(screen.queryByRole("label")).not.toBeInTheDocument();
  });

  it("generates unique id when not provided", () => {
    render(<FormInput label="Test Label" />);

    const input = screen.getByRole("textbox");
    expect(input.id).toMatch(/^«r[\w\d]+»$/);
  });

  it("uses provided id", () => {
    render(<FormInput label="Test Label" id="custom-id" />);

    const input = screen.getByRole("textbox");
    expect(input.id).toBe("custom-id");
  });

  // Required field tests
  it("shows required asterisk when required", () => {
    render(<FormInput label="Required Field" required />);

    expect(screen.getByLabelText("required")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("does not show asterisk when not required", () => {
    render(<FormInput label="Optional Field" />);

    expect(screen.queryByLabelText("required")).not.toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  // Helper text tests
  it("displays helper text when provided", () => {
    render(<FormInput label="Test" helperText="This is helper text" />);

    expect(screen.getByText("This is helper text")).toBeInTheDocument();
  });

  it("associates helper text with input via aria-describedby", () => {
    render(<FormInput label="Test" helperText="Helper text" id="test-input" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby", "test-input-helper");
    expect(screen.getByText("Helper text")).toHaveAttribute(
      "id",
      "test-input-helper"
    );
  });

  // Error handling tests
  it("displays custom error message", () => {
    render(<FormInput label="Test" error="This field is required" />);

    expect(screen.getByText("This field is required")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("applies error styling when hasError is true", () => {
    render(<FormInput label="Test" hasError />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("border-red-500", "focus-visible:ring-red-500");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("prioritizes custom error over form errors", () => {
    const errors = {
      testField: {
        type: "required",
        message: "Form error message",
      },
    };

    render(
      <FormInput
        label="Test"
        name="testField"
        errors={errors}
        error="Custom error message"
      />
    );

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
    expect(screen.queryByText("Form error message")).not.toBeInTheDocument();
  });

  it("hides helper text when error is present", () => {
    render(
      <FormInput label="Test" helperText="Helper text" error="Error message" />
    );

    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
  });

  // Accessibility tests
  it("sets correct aria attributes for error state", () => {
    render(<FormInput label="Test" error="Error message" id="test-input" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "test-input-error");
  });

  it("associates label with input", () => {
    render(<FormInput label="Test Label" id="test-input" />);

    const label = screen.getByText("Test Label");
    expect(label).toHaveAttribute("for", "test-input");
  });

  // User interaction tests
  it("handles user input", async () => {
    const user = userEvent.setup();
    render(<FormInput label="Test" />);

    const input = screen.getByRole("textbox");
    await user.type(input, "Hello world");

    expect(input).toHaveValue("Hello world");
  });

  it("handles focus and blur events", async () => {
    const user = userEvent.setup();
    const onFocus = jest.fn();
    const onBlur = jest.fn();

    render(<FormInput label="Test" onFocus={onFocus} onBlur={onBlur} />);

    const input = screen.getByRole("textbox");
    await user.click(input);
    expect(onFocus).toHaveBeenCalled();

    await user.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  // Input types tests
  it("renders different input types correctly", () => {
    const { rerender } = render(<FormInput type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

    rerender(<FormInput type="password" />);
    expect(screen.getByDisplayValue("")).toHaveAttribute("type", "password");

    rerender(<FormInput type="number" />);
    expect(screen.getByRole("spinbutton")).toHaveAttribute("type", "number");
  });

  // Custom classes tests
  it("applies custom container className", () => {
    render(<FormInput label="Test" containerClassName="custom-container" />);

    const container = screen.getByText("Test").parentElement;
    expect(container).toHaveClass("custom-container");
  });

  it("applies custom label className", () => {
    render(<FormInput label="Test" labelClassName="custom-label" />);

    expect(screen.getByText("Test")).toHaveClass("custom-label");
  });

  it("applies custom input className", () => {
    render(<FormInput label="Test" className="custom-input" />);

    expect(screen.getByRole("textbox")).toHaveClass("custom-input");
  });

  // Forwarded ref test
  it("forwards ref to input element", () => {
    const ref = jest.fn();
    render(<FormInput label="Test" ref={ref} />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  // Name attribute test
  it("passes name attribute to input", () => {
    render(<FormInput label="Test" name="testField" />);

    expect(screen.getByRole("textbox")).toHaveAttribute("name", "testField");
  });
});
