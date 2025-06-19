import { ComponentProps, forwardRef, createElement } from "react";
import { cn } from "@/lib/utils";

// Typography variants for different text styles
type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "div"
  | "small"
  | "strong"
  | "em"
  | "code"
  | "blockquote"
  | "lead"
  | "large"
  | "muted";

// Size variants for consistent typography scale
type TypographySize =
  | "xs"
  | "sm"
  | "base"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl";

// Weight variants
type TypographyWeight =
  | "thin"
  | "light"
  | "normal"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold"
  | "black";

type TypographyProps = {
  variant?: TypographyVariant;
  size?: TypographySize;
  weight?: TypographyWeight;
  className?: string;
  children: React.ReactNode;
} & ComponentProps<"div">;

// Variant styling classes with semantic HTML elements
const variantConfig: Record<
  TypographyVariant,
  { element: string; className: string }
> = {
  h1: {
    element: "h1",
    className: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
  },
  h2: {
    element: "h2",
    className:
      "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
  },
  h3: {
    element: "h3",
    className: "scroll-m-20 text-2xl font-semibold tracking-tight",
  },
  h4: {
    element: "h4",
    className: "scroll-m-20 text-xl font-semibold tracking-tight",
  },
  h5: {
    element: "h5",
    className: "scroll-m-20 text-lg font-semibold tracking-tight",
  },
  h6: {
    element: "h6",
    className: "scroll-m-20 text-base font-semibold tracking-tight",
  },
  p: {
    element: "p",
    className: "leading-7 [&:not(:first-child)]:mt-6",
  },
  span: {
    element: "span",
    className: "",
  },
  div: {
    element: "div",
    className: "",
  },
  small: {
    element: "small",
    className: "text-sm font-medium leading-none",
  },
  strong: {
    element: "strong",
    className: "font-semibold",
  },
  em: {
    element: "em",
    className: "italic",
  },
  code: {
    element: "code",
    className:
      "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
  },
  blockquote: {
    element: "blockquote",
    className: "mt-6 border-l-2 pl-6 italic",
  },
  lead: {
    element: "p",
    className: "text-xl text-muted-foreground",
  },
  large: {
    element: "div",
    className: "text-lg font-semibold",
  },
  muted: {
    element: "p",
    className: "text-sm text-muted-foreground",
  },
};

// Size classes
const sizeClasses: Record<TypographySize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
  "6xl": "text-6xl",
};

// Weight classes
const weightClasses: Record<TypographyWeight, string> = {
  thin: "font-thin",
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
  black: "font-black",
};

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ variant = "p", size, weight, className, children, ...props }, ref) => {
    const config = variantConfig[variant];

    // Build className from variant, size, weight, and custom classes
    const classes = cn(
      config.className,
      size && sizeClasses[size],
      weight && weightClasses[weight],
      className
    );

    // Use createElement to dynamically create the element
    return createElement(
      config.element,
      {
        ref,
        className: classes,
        ...props,
      },
      children
    );
  }
);

Typography.displayName = "Typography";

// Convenience components for common use cases
export const Heading1 = forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="h1" {...props} />);
Heading1.displayName = "Heading1";

export const Heading2 = forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="h2" {...props} />);
Heading2.displayName = "Heading2";

export const Heading3 = forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="h3" {...props} />);
Heading3.displayName = "Heading3";

export const Heading4 = forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="h4" {...props} />);
Heading4.displayName = "Heading4";

export const Paragraph = forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="p" {...props} />);
Paragraph.displayName = "Paragraph";

export const Text = forwardRef<
  HTMLSpanElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="span" {...props} />);
Text.displayName = "Text";

export const Small = forwardRef<HTMLElement, Omit<TypographyProps, "variant">>(
  (props, ref) => <Typography ref={ref} variant="small" {...props} />
);
Small.displayName = "Small";

export const Code = forwardRef<HTMLElement, Omit<TypographyProps, "variant">>(
  (props, ref) => <Typography ref={ref} variant="code" {...props} />
);
Code.displayName = "Code";

export const Lead = forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="lead" {...props} />);
Lead.displayName = "Lead";

export const Large = forwardRef<
  HTMLDivElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="large" {...props} />);
Large.displayName = "Large";

export const Muted = forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="muted" {...props} />);
Muted.displayName = "Muted";

export const Blockquote = forwardRef<
  HTMLQuoteElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="blockquote" {...props} />);
Blockquote.displayName = "Blockquote";
