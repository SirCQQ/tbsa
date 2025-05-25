import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import userEvent from "@testing-library/user-event";

describe("Button Component", () => {
  describe("Rendering", () => {
    it("renders with default variant and size", () => {
      render(<Button>Default Button</Button>);

      const button = screen.getByRole("button", { name: /default button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass(
        "bg-primary",
        "text-primary-foreground",
        "h-9",
        "px-4",
        "py-2"
      );
    });

    it("renders with different variants", () => {
      const variants = [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ] as const;

      variants.forEach((variant) => {
        const { unmount } = render(
          <Button variant={variant}>{variant} Button</Button>
        );

        const button = screen.getByRole("button", {
          name: new RegExp(`${variant} button`, "i"),
        });
        expect(button).toBeInTheDocument();

        // Check specific variant classes
        switch (variant) {
          case "destructive":
            expect(button).toHaveClass(
              "bg-destructive",
              "text-destructive-foreground"
            );
            break;
          case "outline":
            expect(button).toHaveClass(
              "border",
              "border-input",
              "bg-background"
            );
            break;
          case "secondary":
            expect(button).toHaveClass(
              "bg-secondary",
              "text-secondary-foreground"
            );
            break;
          case "ghost":
            expect(button).toHaveClass(
              "hover:bg-accent",
              "hover:text-accent-foreground"
            );
            break;
          case "link":
            expect(button).toHaveClass("text-primary", "underline-offset-4");
            break;
        }

        unmount();
      });
    });

    it("renders with different sizes", () => {
      const sizes = ["default", "sm", "lg", "icon"] as const;

      sizes.forEach((size) => {
        const { unmount } = render(<Button size={size}>{size} Button</Button>);

        const button = screen.getByRole("button", {
          name: new RegExp(`${size} button`, "i"),
        });
        expect(button).toBeInTheDocument();

        // Check specific size classes
        switch (size) {
          case "sm":
            expect(button).toHaveClass("h-8", "px-3", "text-xs");
            break;
          case "lg":
            expect(button).toHaveClass("h-10", "px-8");
            break;
          case "icon":
            expect(button).toHaveClass("h-9", "w-9");
            break;
          default:
            expect(button).toHaveClass("h-9", "px-4", "py-2");
        }

        unmount();
      });
    });
  });

  describe("Interactions", () => {
    it("calls onClick handler when clicked", () => {
      const onClickMock = jest.fn();
      render(<Button onClick={onClickMock}>Click me</Button>);

      const button = screen.getByRole("button", { name: /click me/i });
      fireEvent.click(button);

      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", () => {
      const onClickMock = jest.fn();
      render(
        <Button onClick={onClickMock} disabled>
          Disabled Button
        </Button>
      );

      const button = screen.getByRole("button", { name: /disabled button/i });
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(onClickMock).not.toHaveBeenCalled();
    });

    it("handles keyboard interactions", async () => {
      const user = userEvent.setup();
      const onClickMock = jest.fn();
      render(<Button onClick={onClickMock}>Keyboard Button</Button>);

      const button = screen.getByRole("button", { name: /keyboard button/i });
      button.focus();

      // Use userEvent instead of fireEvent for more realistic keyboard interactions
      await user.keyboard("{Enter}");
      expect(onClickMock).toHaveBeenCalledTimes(1);

      await user.keyboard(" ");
      expect(onClickMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("Props and Attributes", () => {
    it("forwards custom className", () => {
      render(<Button className="custom-class">Custom Button</Button>);

      const button = screen.getByRole("button", { name: /custom button/i });
      expect(button).toHaveClass("custom-class");
    });

    it("forwards custom attributes", () => {
      render(
        <Button data-testid="custom-button" type="submit" id="btn-id">
          Custom Button
        </Button>
      );

      const button = screen.getByTestId("custom-button");
      expect(button).toHaveAttribute("type", "submit");
      expect(button).toHaveAttribute("id", "btn-id");
    });

    it("renders as child component when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      const link = screen.getByRole("link", { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/test");
      expect(link).toHaveClass("inline-flex", "items-center", "justify-center");
    });
  });

  describe("Accessibility", () => {
    it("has proper accessibility attributes", () => {
      render(<Button type="submit">Accessible Button</Button>);

      const button = screen.getByRole("button", { name: /accessible button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("type", "submit");
    });

    it("supports aria-label", () => {
      render(<Button aria-label="Close dialog">×</Button>);

      const button = screen.getByRole("button", { name: /close dialog/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("aria-label", "Close dialog");
    });

    it("is focusable and has focus styles", () => {
      render(<Button>Focusable Button</Button>);

      const button = screen.getByRole("button", { name: /focusable button/i });
      button.focus();

      expect(button).toHaveFocus();
      expect(button).toHaveClass(
        "focus-visible:outline-none",
        "focus-visible:ring-1"
      );
    });
  });
});
