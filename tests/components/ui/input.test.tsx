import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("Input Component", () => {
  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<Input placeholder="Test input" />);

      const input = screen.getByPlaceholderText("Test input");
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass(
        "flex",
        "h-9",
        "w-full",
        "rounded-md",
        "border"
      );
    });

    it("renders with different input types", () => {
      const types = [
        "text",
        "email",
        "password",
        "number",
        "tel",
        "url",
      ] as const;

      types.forEach((type) => {
        const { unmount } = render(
          <Input type={type} placeholder={`${type} input`} />
        );

        const input = screen.getByPlaceholderText(`${type} input`);
        expect(input).toHaveAttribute("type", type);

        unmount();
      });
    });

    it("applies custom className", () => {
      render(<Input className="custom-class" placeholder="Custom input" />);

      const input = screen.getByPlaceholderText("Custom input");
      expect(input).toHaveClass("custom-class");
    });

    it("forwards ref correctly", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} placeholder="Ref input" />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current).toHaveAttribute("placeholder", "Ref input");
    });
  });

  describe("Props and Attributes", () => {
    it("forwards HTML input attributes", () => {
      render(
        <Input
          id="test-input"
          name="testName"
          placeholder="Test placeholder"
          required
          disabled
          maxLength={10}
          data-testid="input-test"
        />
      );

      const input = screen.getByTestId("input-test");
      expect(input).toHaveAttribute("id", "test-input");
      expect(input).toHaveAttribute("name", "testName");
      expect(input).toHaveAttribute("placeholder", "Test placeholder");
      expect(input).toHaveAttribute("maxlength", "10");
      expect(input).toBeRequired();
      expect(input).toBeDisabled();
    });

    it("supports value and defaultValue", () => {
      const { rerender } = render(<Input defaultValue="default text" />);

      const input = screen.getByDisplayValue("default text");
      expect(input).toHaveValue("default text");

      rerender(<Input value="controlled value" onChange={() => {}} />);
      expect(input).toHaveValue("controlled value");
    });
  });

  describe("User Interactions", () => {
    it("handles user typing", async () => {
      const user = userEvent.setup();
      const onChangeMock = jest.fn();

      render(<Input onChange={onChangeMock} placeholder="Type here" />);

      const input = screen.getByPlaceholderText("Type here");
      await user.type(input, "Hello World");

      expect(input).toHaveValue("Hello World");
      expect(onChangeMock).toHaveBeenCalledTimes(11); // "Hello World" = 11 characters
    });

    it("handles focus and blur events", async () => {
      const user = userEvent.setup();
      const onFocusMock = jest.fn();
      const onBlurMock = jest.fn();

      render(
        <Input
          onFocus={onFocusMock}
          onBlur={onBlurMock}
          placeholder="Focus test"
        />
      );

      const input = screen.getByPlaceholderText("Focus test");

      await user.click(input);
      expect(onFocusMock).toHaveBeenCalledTimes(1);
      expect(input).toHaveFocus();

      await user.tab();
      expect(onBlurMock).toHaveBeenCalledTimes(1);
      expect(input).not.toHaveFocus();
    });

    it("handles keyboard events", async () => {
      const user = userEvent.setup();
      const onKeyDownMock = jest.fn();

      render(<Input onKeyDown={onKeyDownMock} placeholder="Keyboard test" />);

      const input = screen.getByPlaceholderText("Keyboard test");
      await user.click(input);
      await user.keyboard("{Enter}");

      expect(onKeyDownMock).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "Enter",
        })
      );
    });
  });

  describe("Validation and States", () => {
    it("shows invalid state with aria-invalid", () => {
      render(<Input aria-invalid placeholder="Invalid input" />);

      const input = screen.getByPlaceholderText("Invalid input");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("respects disabled state", async () => {
      const user = userEvent.setup();
      const onChangeMock = jest.fn();

      render(
        <Input disabled onChange={onChangeMock} placeholder="Disabled input" />
      );

      const input = screen.getByPlaceholderText("Disabled input");
      expect(input).toBeDisabled();

      await user.type(input, "Should not work");
      expect(onChangeMock).not.toHaveBeenCalled();
      expect(input).toHaveValue("");
    });

    it("respects readonly state", async () => {
      const user = userEvent.setup();
      const onChangeMock = jest.fn();

      render(
        <Input
          readOnly
          defaultValue="readonly value"
          onChange={onChangeMock}
          placeholder="Readonly input"
        />
      );

      const input = screen.getByDisplayValue("readonly value");
      expect(input).toHaveAttribute("readonly");

      await user.type(input, "Should not change");
      expect(input).toHaveValue("readonly value");
    });
  });

  describe("File Input", () => {
    it("handles file input type", () => {
      render(<Input type="file" data-testid="file-input" />);

      const input = screen.getByTestId("file-input");
      expect(input).toHaveAttribute("type", "file");
      expect(input).toHaveClass("file:border-0", "file:bg-transparent");
    });

    it("handles file selection", async () => {
      const user = userEvent.setup();
      const onChangeMock = jest.fn();

      render(
        <Input type="file" onChange={onChangeMock} data-testid="file-input" />
      );

      const input = screen.getByTestId("file-input") as HTMLInputElement;
      const file = new File(["hello"], "hello.png", { type: "image/png" });

      await user.upload(input, file);

      expect(onChangeMock).toHaveBeenCalled();
      expect(input.files?.[0]).toBe(file);
      expect(input.files).toHaveLength(1);
    });
  });

  describe("Accessibility", () => {
    it("supports aria-describedby for error messages", () => {
      render(
        <>
          <Input
            aria-describedby="error-message"
            placeholder="Input with error"
          />
          <div id="error-message">This field is required</div>
        </>
      );

      const input = screen.getByPlaceholderText("Input with error");
      expect(input).toHaveAttribute("aria-describedby", "error-message");

      const errorMessage = screen.getByText("This field is required");
      expect(errorMessage).toBeInTheDocument();
    });

    it("supports aria-label for accessibility", () => {
      render(<Input aria-label="Search users" placeholder="Search..." />);

      const input = screen.getByLabelText("Search users");
      expect(input).toBeInTheDocument();
    });

    it("works with form labels", () => {
      render(
        <>
          <label htmlFor="username">Username</label>
          <Input id="username" placeholder="Enter username" />
        </>
      );

      const input = screen.getByLabelText("Username");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("id", "username");
    });
  });
});
