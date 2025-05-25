import React from "react";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";
import "@testing-library/jest-dom";

describe("Badge Component", () => {
  describe("Rendering", () => {
    it("renders with default variant", () => {
      render(<Badge>Default Badge</Badge>);
      const badge = screen.getByText("Default Badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(
        "inline-flex",
        "items-center",
        "rounded-md",
        "border",
        "px-2.5",
        "py-0.5",
        "text-xs",
        "font-semibold"
      );
      expect(badge).toHaveClass("bg-primary", "text-primary-foreground");
    });

    it("renders with all available variants", () => {
      const variants = [
        "default",
        "secondary",
        "destructive",
        "outline",
      ] as const;

      variants.forEach((variant) => {
        const { unmount } = render(
          <Badge variant={variant} data-testid={`badge-${variant}`}>
            {variant} Badge
          </Badge>
        );

        const badge = screen.getByTestId(`badge-${variant}`);
        expect(badge).toBeInTheDocument();

        switch (variant) {
          case "secondary":
            expect(badge).toHaveClass(
              "bg-secondary",
              "text-secondary-foreground"
            );
            break;
          case "destructive":
            expect(badge).toHaveClass(
              "bg-destructive",
              "text-destructive-foreground"
            );
            break;
          case "outline":
            expect(badge).toHaveClass("text-foreground");
            expect(badge).not.toHaveClass("border-transparent");
            break;
          default:
            expect(badge).toHaveClass("bg-primary", "text-primary-foreground");
        }

        unmount();
      });
    });

    it("applies custom className", () => {
      render(<Badge className="custom-badge">Custom Badge</Badge>);

      const badge = screen.getByText("Custom Badge");
      expect(badge).toHaveClass("custom-badge");
    });
  });

  describe("Content and Children", () => {
    it("renders text content", () => {
      render(<Badge>Text Badge</Badge>);

      const badge = screen.getByText("Text Badge");
      expect(badge).toBeInTheDocument();
    });

    it("renders with numbers", () => {
      render(<Badge>99+</Badge>);

      const badge = screen.getByText("99+");
      expect(badge).toBeInTheDocument();
    });

    it("renders with mixed content", () => {
      render(
        <Badge data-testid="mixed-content-badge">
          <span>Status: </span>
          <strong>Active</strong>
        </Badge>
      );

      const badge = screen.getByTestId("mixed-content-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Status: Active");
      expect(badge.querySelector("span")).toBeInTheDocument();
      expect(badge.querySelector("strong")).toBeInTheDocument();
    });

    it("renders empty badge", () => {
      render(<Badge data-testid="empty-badge"></Badge>);

      const badge = screen.getByTestId("empty-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toBeEmptyDOMElement();
    });
  });

  describe("Props and Attributes", () => {
    it("forwards HTML div attributes", () => {
      render(
        <Badge
          id="badge-id"
          role="status"
          aria-label="Notification count"
          data-testid="badge-test"
          title="Hover text"
        >
          5
        </Badge>
      );

      const badge = screen.getByTestId("badge-test");
      expect(badge).toHaveAttribute("id", "badge-id");
      expect(badge).toHaveAttribute("role", "status");
      expect(badge).toHaveAttribute("aria-label", "Notification count");
      expect(badge).toHaveAttribute("title", "Hover text");
    });

    it("supports onClick handler", () => {
      const onClickMock = jest.fn();
      render(
        <Badge onClick={onClickMock} role="button">
          Clickable Badge
        </Badge>
      );

      const badge = screen.getByRole("button", { name: "Clickable Badge" });
      badge.click();

      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it("supports style prop", () => {
      render(
        <Badge style={{ backgroundColor: "red", color: "white" }}>
          Styled Badge
        </Badge>
      );

      const badge = screen.getByText("Styled Badge");
      expect(badge).toHaveStyle({
        "background-color": "red",
        color: "white",
      });
    });
  });

  describe("Accessibility", () => {
    it("supports screen reader text", () => {
      render(<Badge aria-label="3 unread notifications">3</Badge>);

      const badge = screen.getByLabelText("3 unread notifications");
      expect(badge).toBeInTheDocument();
    });

    it("supports status role for notifications", () => {
      render(
        <Badge role="status" aria-live="polite">
          Online
        </Badge>
      );

      const badge = screen.getByRole("status");
      expect(badge).toHaveAttribute("aria-live", "polite");
    });

    it("supports hidden badges for decorative purposes", () => {
      render(<Badge aria-hidden="true">Decorative</Badge>);

      const badge = screen.getByText("Decorative");
      expect(badge).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Visual States", () => {
    it("applies focus styles when focusable", () => {
      render(
        <Badge tabIndex={0} data-testid="focusable-badge">
          Focusable Badge
        </Badge>
      );

      const badge = screen.getByTestId("focusable-badge");
      expect(badge).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-ring"
      );

      badge.focus();
      expect(badge).toHaveFocus();
    });

    it("applies hover styles", () => {
      render(<Badge variant="default">Hover Badge</Badge>);

      const badge = screen.getByText("Hover Badge");
      expect(badge).toHaveClass("hover:bg-primary/80");
    });
  });

  describe("Combination with other elements", () => {
    it("works well in button context", () => {
      render(
        <button>
          Messages <Badge variant="destructive">5</Badge>
        </button>
      );

      const button = screen.getByRole("button");
      const badge = screen.getByText("5");

      expect(button).toContainElement(badge);
      expect(badge).toHaveClass("bg-destructive");
    });

    it("works in navigation context", () => {
      render(
        <nav>
          <a href="/notifications">
            Notifications
            <Badge
              variant="secondary"
              role="status"
              aria-label="2 new notifications"
            >
              2
            </Badge>
          </a>
        </nav>
      );

      const link = screen.getByRole("link", { name: /notifications/i });
      const badge = screen.getByRole("status");

      expect(link).toContainElement(badge);
      expect(badge).toHaveClass("bg-secondary");
    });

    it("works in list context", () => {
      render(
        <ul>
          <li>
            Task 1 <Badge variant="outline">Pending</Badge>
          </li>
          <li>
            Task 2 <Badge variant="destructive">Urgent</Badge>
          </li>
        </ul>
      );

      const pendingBadge = screen.getByText("Pending");
      const urgentBadge = screen.getByText("Urgent");

      expect(pendingBadge).toHaveClass("text-foreground");
      expect(urgentBadge).toHaveClass("bg-destructive");
    });
  });
});
