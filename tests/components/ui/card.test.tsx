import React from "react";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

describe("Card Components", () => {
  describe("Card Component", () => {
    it("renders with default styling", () => {
      render(
        <Card data-testid="card">
          <p>Card content</p>
        </Card>
      );

      const card = screen.getByTestId("card");
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass(
        "rounded-xl",
        "border",
        "bg-card",
        "text-card-foreground",
        "shadow"
      );
    });

    it("applies custom className", () => {
      render(
        <Card className="custom-card-class" data-testid="card">
          Content
        </Card>
      );

      const card = screen.getByTestId("card");
      expect(card).toHaveClass("custom-card-class");
    });

    it("forwards HTML attributes", () => {
      render(
        <Card id="card-id" role="region" aria-label="Information card">
          Content
        </Card>
      );

      const card = screen.getByRole("region", { name: "Information card" });
      expect(card).toHaveAttribute("id", "card-id");
    });

    it("forwards ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Card with ref</Card>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveTextContent("Card with ref");
    });
  });

  describe("CardHeader Component", () => {
    it("renders with default styling", () => {
      render(<CardHeader data-testid="card-header">Header content</CardHeader>);

      const header = screen.getByTestId("card-header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass("flex", "flex-col", "space-y-1.5", "p-6");
    });

    it("applies custom className", () => {
      render(
        <CardHeader className="custom-header" data-testid="card-header">
          Header
        </CardHeader>
      );

      const header = screen.getByTestId("card-header");
      expect(header).toHaveClass("custom-header");
    });

    it("forwards ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardHeader ref={ref}>Header content</CardHeader>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("CardTitle Component", () => {
    it("renders with default styling", () => {
      render(<CardTitle>Card Title</CardTitle>);

      const title = screen.getByText("Card Title");
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass(
        "font-semibold",
        "leading-none",
        "tracking-tight"
      );
    });

    it("applies custom className", () => {
      render(<CardTitle className="custom-title">Title</CardTitle>);

      const title = screen.getByText("Title");
      expect(title).toHaveClass("custom-title");
    });

    it("forwards ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardTitle ref={ref}>Title</CardTitle>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveTextContent("Title");
    });
  });

  describe("CardDescription Component", () => {
    it("renders with default styling", () => {
      render(<CardDescription>Card description text</CardDescription>);

      const description = screen.getByText("Card description text");
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass("text-sm", "text-muted-foreground");
    });

    it("applies custom className", () => {
      render(
        <CardDescription className="custom-desc">Description</CardDescription>
      );

      const description = screen.getByText("Description");
      expect(description).toHaveClass("custom-desc");
    });

    it("forwards ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardDescription ref={ref}>Description</CardDescription>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("CardContent Component", () => {
    it("renders with default styling", () => {
      render(
        <CardContent data-testid="card-content">Main content</CardContent>
      );

      const content = screen.getByTestId("card-content");
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass("p-6", "pt-0");
    });

    it("applies custom className", () => {
      render(
        <CardContent className="custom-content" data-testid="card-content">
          Content
        </CardContent>
      );

      const content = screen.getByTestId("card-content");
      expect(content).toHaveClass("custom-content");
    });

    it("forwards ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardContent ref={ref}>Content</CardContent>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("CardFooter Component", () => {
    it("renders with default styling", () => {
      render(<CardFooter data-testid="card-footer">Footer content</CardFooter>);

      const footer = screen.getByTestId("card-footer");
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass("flex", "items-center", "p-6", "pt-0");
    });

    it("applies custom className", () => {
      render(
        <CardFooter className="custom-footer" data-testid="card-footer">
          Footer
        </CardFooter>
      );

      const footer = screen.getByTestId("card-footer");
      expect(footer).toHaveClass("custom-footer");
    });

    it("forwards ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardFooter ref={ref}>Footer</CardFooter>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("Complete Card Structure", () => {
    it("renders a complete card with all components", () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Test Card Title</CardTitle>
            <CardDescription>This is a test card description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Action Button</button>
          </CardFooter>
        </Card>
      );

      const card = screen.getByTestId("complete-card");
      const title = screen.getByText("Test Card Title");
      const description = screen.getByText("This is a test card description");
      const content = screen.getByText("This is the main content of the card.");
      const button = screen.getByRole("button", { name: "Action Button" });

      expect(card).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
      expect(content).toBeInTheDocument();
      expect(button).toBeInTheDocument();

      // Check component hierarchy
      expect(card).toContainElement(title);
      expect(card).toContainElement(description);
      expect(card).toContainElement(content);
      expect(card).toContainElement(button);
    });

    it("renders minimal card with just content", () => {
      render(
        <Card>
          <CardContent>Minimal card content</CardContent>
        </Card>
      );

      const content = screen.getByText("Minimal card content");
      expect(content).toBeInTheDocument();
    });

    it("renders card without footer", () => {
      render(
        <Card data-testid="no-footer-card">
          <CardHeader>
            <CardTitle>No Footer Card</CardTitle>
          </CardHeader>
          <CardContent>Content without footer</CardContent>
        </Card>
      );

      const card = screen.getByTestId("no-footer-card");
      const title = screen.getByText("No Footer Card");
      const content = screen.getByText("Content without footer");

      expect(card).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(content).toBeInTheDocument();

      // Ensure no footer element exists
      expect(
        card.querySelector('[class*="flex items-center p-6 pt-0"]')
      ).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("supports ARIA attributes", () => {
      render(
        <Card
          role="article"
          aria-labelledby="card-title"
          aria-describedby="card-desc"
          data-testid="accessible-card"
        >
          <CardHeader>
            <CardTitle id="card-title">Accessible Card</CardTitle>
            <CardDescription id="card-desc">
              This card has proper ARIA attributes
            </CardDescription>
          </CardHeader>
          <CardContent>Accessible content</CardContent>
        </Card>
      );

      const card = screen.getByTestId("accessible-card");
      expect(card).toHaveAttribute("role", "article");
      expect(card).toHaveAttribute("aria-labelledby", "card-title");
      expect(card).toHaveAttribute("aria-describedby", "card-desc");

      const title = screen.getByText("Accessible Card");
      const description = screen.getByText(
        "This card has proper ARIA attributes"
      );

      expect(title).toHaveAttribute("id", "card-title");
      expect(description).toHaveAttribute("id", "card-desc");
    });
  });
});
