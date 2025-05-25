import { render, screen } from "@testing-library/react";
import { FormErrorMessage } from "@/components/ui/form-error-message";

describe("FormErrorMessage", () => {
  // Basic rendering tests
  it("renders custom error message", () => {
    render(<FormErrorMessage message="This is an error" />);

    expect(screen.getByText("This is an error")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("does not render when message is empty string", () => {
    render(<FormErrorMessage message="" />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not render when message is only whitespace", () => {
    render(<FormErrorMessage message="   " />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not render when message is undefined", () => {
    render(<FormErrorMessage message={undefined} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not render when message is null", () => {
    render(<FormErrorMessage message={null as any} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // Form errors tests
  it("renders form error when field has error", () => {
    const errors = {
      testField: {
        type: "required",
        message: "Field is required",
      },
    };

    render(<FormErrorMessage name="testField" errors={errors} />);

    expect(screen.getByText("Field is required")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("does not render when field has no error", () => {
    const errors = {
      otherField: {
        type: "required",
        message: "Other field error",
      },
    };

    render(<FormErrorMessage name="testField" errors={errors} />);

    expect(screen.queryByText("Other field error")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not render when errors object is empty", () => {
    render(<FormErrorMessage name="testField" errors={{}} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not render when errors is undefined", () => {
    render(<FormErrorMessage name="testField" errors={undefined} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not render when errors is null", () => {
    render(<FormErrorMessage name="testField" errors={null as any} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not render when name is missing but errors exist", () => {
    const errors = {
      testField: {
        type: "required",
        message: "Field is required",
      },
    };

    render(<FormErrorMessage errors={errors} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not render when field error has no message", () => {
    const errors = {
      testField: {
        type: "required",
        // No message property
      },
    };

    render(<FormErrorMessage name="testField" errors={errors} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // Priority tests
  it("prioritizes custom message over form errors", () => {
    const errors = {
      testField: {
        type: "required",
        message: "Form error message",
      },
    };

    render(
      <FormErrorMessage
        name="testField"
        errors={errors}
        message="Custom error message"
      />
    );

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
    expect(screen.queryByText("Form error message")).not.toBeInTheDocument();
  });

  it("falls back to form error when custom message is empty", () => {
    const errors = {
      testField: {
        type: "required",
        message: "Form error message",
      },
    };

    render(<FormErrorMessage name="testField" errors={errors} message="" />);

    expect(screen.getByText("Form error message")).toBeInTheDocument();
  });

  // Custom render function tests
  it("uses custom render function", () => {
    const customRender = ({ message }: { message: string }) => (
      <div data-testid="custom-error" className="custom-error">
        Error: {message}
      </div>
    );

    render(<FormErrorMessage message="Test error" render={customRender} />);

    expect(screen.getByTestId("custom-error")).toBeInTheDocument();
    expect(screen.getByText("Error: Test error")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("uses custom render function with form errors", () => {
    const errors = {
      testField: {
        type: "required",
        message: "Field is required",
      },
    };

    const customRender = ({ message }: { message: string }) => (
      <div data-testid="custom-error">Custom: {message}</div>
    );

    render(
      <FormErrorMessage
        name="testField"
        errors={errors}
        render={customRender}
      />
    );

    expect(screen.getByTestId("custom-error")).toBeInTheDocument();
    expect(screen.getByText("Custom: Field is required")).toBeInTheDocument();
  });

  // Styling and props tests
  it("applies custom className", () => {
    render(
      <FormErrorMessage message="Test error" className="custom-error-class" />
    );

    const errorElement = screen.getByRole("alert");
    expect(errorElement).toHaveClass("custom-error-class");
    expect(errorElement).toHaveClass("text-sm", "text-red-600");
  });

  it("passes through additional props", () => {
    render(
      <FormErrorMessage
        message="Test error"
        data-testid="error-message"
        id="custom-id"
      />
    );

    const errorElement = screen.getByTestId("error-message");
    expect(errorElement).toHaveAttribute("id", "custom-id");
    expect(errorElement).toHaveAttribute("role", "alert");
  });

  // No parameters test
  it("does not render when no parameters are provided", () => {
    render(<FormErrorMessage />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // Edge cases
  it("handles malformed errors object", () => {
    render(
      <FormErrorMessage name="testField" errors={"not-an-object" as any} />
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("handles field error without proper structure", () => {
    const errors = {
      testField: "string instead of object",
    };

    render(<FormErrorMessage name="testField" errors={errors as any} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders message with whitespace", () => {
    render(<FormErrorMessage message="  Valid message  " />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Valid message");
  });
});
