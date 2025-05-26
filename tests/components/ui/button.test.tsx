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
        "h-11",
        "px-4",
        "py-2",
        "md:h-10"
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
            expect(button).toHaveClass("bg-destructive");
            break;
          case "outline":
            expect(button).toHaveClass("border", "border-input");
            break;
          case "secondary":
            expect(button).toHaveClass("bg-secondary");
            break;
          case "ghost":
            expect(button).toHaveClass("hover:bg-accent");
            break;
          case "link":
            expect(button).toHaveClass("text-primary", "underline-offset-4");
            break;
          default:
            expect(button).toHaveClass("bg-primary");
        }

        unmount();
      });
    });

    it("renders with different sizes", () => {
      const sizes = ["default", "sm", "lg", "xl", "icon", "icon-sm"] as const;

      sizes.forEach((size) => {
        const { unmount } = render(<Button size={size}>{size} Button</Button>);

        const button = screen.getByRole("button", {
          name: new RegExp(`${size} button`, "i"),
        });
        expect(button).toBeInTheDocument();

        // Check specific size classes
        switch (size) {
          case "sm":
            expect(button).toHaveClass("h-10", "px-3", "text-xs", "md:h-9");
            break;
          case "lg":
            expect(button).toHaveClass("h-12", "px-8", "md:h-11");
            break;
          case "xl":
            expect(button).toHaveClass("h-14", "px-10", "text-base");
            break;
          case "icon":
            expect(button).toHaveClass("h-11", "w-11", "md:h-10", "md:w-10");
            break;
          case "icon-sm":
            expect(button).toHaveClass("h-10", "w-10", "md:h-9", "md:w-9");
            break;
          default:
            expect(button).toHaveClass("h-11", "px-4", "py-2", "md:h-10");
        }

        unmount();
      });
    });
  });

  describe("Touch-friendly sizing", () => {
    it("has minimum 44px height on mobile for touch accessibility", () => {
      render(<Button>Touch Button</Button>);

      const button = screen.getByRole("button", { name: /touch button/i });
      expect(button).toHaveClass("h-11"); // 44px minimum for touch
    });

    it("provides appropriate touch targets for icon buttons", () => {
      render(<Button size="icon">Icon</Button>);

      const button = screen.getByRole("button", { name: /icon/i });
      expect(button).toHaveClass("h-11", "w-11"); // 44px x 44px minimum
    });

    it("maintains smaller sizes on desktop with responsive classes", () => {
      render(<Button>Responsive Button</Button>);

      const button = screen.getByRole("button", { name: /responsive button/i });
      expect(button).toHaveClass("md:h-10"); // Smaller on desktop
    });
  });

  describe("Interactions", () => {
    it("handles click events", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole("button", { name: /click me/i });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("can be disabled", () => {
      const handleClick = jest.fn();

      render(
        <Button onClick={handleClick} disabled>
          Disabled Button
        </Button>
      );

      const button = screen.getByRole("button", { name: /disabled button/i });
      expect(button).toBeDisabled();
      expect(button).toHaveClass("disabled:pointer-events-none");

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("supports keyboard navigation", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Keyboard Button</Button>);

      const button = screen.getByRole("button", { name: /keyboard button/i });
      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(handleClick).toHaveBeenCalledTimes(1);

      await user.keyboard(" ");
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe("Accessibility", () => {
    it("has proper focus styles", () => {
      render(<Button>Focus Button</Button>);

      const button = screen.getByRole("button", { name: /focus button/i });
      expect(button).toHaveClass(
        "focus-visible:outline-none",
        "focus-visible:ring-1"
      );
    });

    it("supports asChild prop with proper accessibility", () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      const link = screen.getByRole("link", { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/test");
    });
  });
});
