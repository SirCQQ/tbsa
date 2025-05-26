import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormTextarea } from "@/components/form/form-textarea";

describe("FormTextarea", () => {
  // Basic rendering tests
  it("renders textarea with label", () => {
    render(<FormTextarea label="Test Label" />);

    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders without label", () => {
    render(<FormTextarea placeholder="Enter text" />);

    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    expect(screen.queryByRole("label")).not.toBeInTheDocument();
  });

  it("generates unique id when not provided", () => {
    render(<FormTextarea label="Test Label" />);

    const textarea = screen.getByRole("textbox");
    expect(textarea.id).toMatch(/^«r[\w\d]+»$/);
  });

  it("uses provided id", () => {
    render(<FormTextarea label="Test Label" id="custom-id" />);

    const textarea = screen.getByRole("textbox");
    expect(textarea.id).toBe("custom-id");
  });

  // Required field tests
  it("shows required asterisk when required", () => {
    render(<FormTextarea label="Required Field" required />);

    expect(screen.getByLabelText("required")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("does not show asterisk when not required", () => {
    render(<FormTextarea label="Optional Field" />);

    expect(screen.queryByLabelText("required")).not.toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  // Helper text tests
  it("displays helper text when provided", () => {
    render(<FormTextarea label="Test" helperText="This is helper text" />);

    expect(screen.getByText("This is helper text")).toBeInTheDocument();
  });

  it("associates helper text with textarea via aria-describedby", () => {
    render(
      <FormTextarea label="Test" helperText="Helper text" id="test-textarea" />
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute(
      "aria-describedby",
      "test-textarea-helper"
    );
    expect(screen.getByText("Helper text")).toHaveAttribute(
      "id",
      "test-textarea-helper"
    );
  });

  // Error handling tests
  it("displays custom error message", () => {
    render(<FormTextarea label="Test" error="This field is required" />);

    expect(screen.getByText("This field is required")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("applies error styling when hasError is true", () => {
    render(<FormTextarea label="Test" hasError />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveClass(
      "border-red-500",
      "focus-visible:ring-red-500"
    );
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("prioritizes custom error over form errors", () => {
    const errors = {
      testField: {
        type: "required",
        message: "Form error message",
      },
    };

    render(
      <FormTextarea
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
      <FormTextarea
        label="Test"
        helperText="Helper text"
        error="Error message"
      />
    );

    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
  });

  // Accessibility tests
  it("sets correct aria attributes for error state", () => {
    render(
      <FormTextarea label="Test" error="Error message" id="test-textarea" />
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAttribute("aria-describedby", "test-textarea-error");
  });

  it("associates label with textarea", () => {
    render(<FormTextarea label="Test Label" id="test-textarea" />);

    const label = screen.getByText("Test Label");
    expect(label).toHaveAttribute("for", "test-textarea");
  });

  // User interaction tests
  it("handles user input", async () => {
    const user = userEvent.setup();
    render(<FormTextarea label="Test" />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Hello world\nMultiple lines");

    expect(textarea).toHaveValue("Hello world\nMultiple lines");
  });

  it("handles focus and blur events", async () => {
    const user = userEvent.setup();
    const onFocus = jest.fn();
    const onBlur = jest.fn();

    render(<FormTextarea label="Test" onFocus={onFocus} onBlur={onBlur} />);

    const textarea = screen.getByRole("textbox");
    await user.click(textarea);
    expect(onFocus).toHaveBeenCalled();

    await user.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  // Textarea specific props
  it("renders with custom rows", () => {
    render(<FormTextarea label="Test" rows={10} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "10");
  });

  it("renders with custom cols", () => {
    render(<FormTextarea label="Test" cols={50} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("cols", "50");
  });

  it("handles resize attribute", () => {
    render(<FormTextarea label="Test" style={{ resize: "vertical" }} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveStyle("resize: vertical");
  });

  // Custom classes tests
  it("applies custom container className", () => {
    render(<FormTextarea label="Test" containerClassName="custom-container" />);

    const container = screen.getByText("Test").parentElement;
    expect(container).toHaveClass("custom-container");
  });

  it("applies custom label className", () => {
    render(<FormTextarea label="Test" labelClassName="custom-label" />);

    expect(screen.getByText("Test")).toHaveClass("custom-label");
  });

  it("applies custom textarea className", () => {
    render(<FormTextarea label="Test" className="custom-textarea" />);

    expect(screen.getByRole("textbox")).toHaveClass("custom-textarea");
  });

  // Forwarded ref test
  it("forwards ref to textarea element", () => {
    const ref = jest.fn();
    render(<FormTextarea label="Test" ref={ref} />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
  });

  // Name attribute test
  it("passes name attribute to textarea", () => {
    render(<FormTextarea label="Test" name="testField" />);

    expect(screen.getByRole("textbox")).toHaveAttribute("name", "testField");
  });

  // Disabled state test
  it("handles disabled state", () => {
    render(<FormTextarea label="Test" disabled />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  // Placeholder test
  it("shows placeholder text", () => {
    render(<FormTextarea placeholder="Enter your message here" />);

    expect(
      screen.getByPlaceholderText("Enter your message here")
    ).toBeInTheDocument();
  });

  // Max length test
  it("respects maxLength attribute", () => {
    render(<FormTextarea label="Test" maxLength={100} />);

    expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "100");
  });
});
