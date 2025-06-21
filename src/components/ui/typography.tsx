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

// Gradient variants for text
type TypographyGradient =
  | "primary"
  | "blue"
  | "green"
  | "purple"
  | "cyan"
  | "red"
  | "orange"
  | "yellow"
  | "pink"
  | "indigo"
  | "emerald"
  | "teal"
  | "violet"
  | "rose"
  | "sky"
  | "lime"
  | "amber"
  | "sunset"
  | "ocean"
  | "forest"
  | "aurora"
  | "twilight"
  | "rainbow";

type TypographyProps = {
  variant?: TypographyVariant;
  size?: TypographySize;
  weight?: TypographyWeight;
  gradient?: TypographyGradient;
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

// Gradient classes for text
const gradientClasses: Record<TypographyGradient, string> = {
  // Single color gradients
  primary:
    "bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent",
  blue: "bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent",
  green:
    "bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent",
  purple:
    "bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent",
  cyan: "bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent",
  red: "bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent",
  orange:
    "bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent",
  yellow:
    "bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent",
  pink: "bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent",
  indigo:
    "bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent",
  emerald:
    "bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent",
  teal: "bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent",
  violet:
    "bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent",
  rose: "bg-gradient-to-r from-rose-600 to-rose-400 bg-clip-text text-transparent",
  sky: "bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent",
  lime: "bg-gradient-to-r from-lime-600 to-lime-400 bg-clip-text text-transparent",
  amber:
    "bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent",

  // Multi-color themed gradients
  sunset:
    "bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 bg-clip-text text-transparent",
  ocean:
    "bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent",
  forest:
    "bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent",
  aurora:
    "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent",
  twilight:
    "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent",
  rainbow:
    "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent",
};

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  (
    { variant = "p", size, weight, gradient, className, children, ...props },
    ref
  ) => {
    const config = variantConfig[variant];

    // Build className from variant, size, weight, gradient, and custom classes
    const classes = cn(
      config.className,
      size && sizeClasses[size],
      weight && weightClasses[weight],
      gradient && gradientClasses[gradient],
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

// Gradient text convenience components
export const GradientHeading1 = forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant"> & { gradient: TypographyGradient }
>((props, ref) => <Typography ref={ref} variant="h1" {...props} />);
GradientHeading1.displayName = "GradientHeading1";

export const GradientHeading2 = forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant"> & { gradient: TypographyGradient }
>((props, ref) => <Typography ref={ref} variant="h2" {...props} />);
GradientHeading2.displayName = "GradientHeading2";

export const GradientText = forwardRef<
  HTMLSpanElement,
  Omit<TypographyProps, "variant"> & { gradient: TypographyGradient }
>((props, ref) => <Typography ref={ref} variant="span" {...props} />);
GradientText.displayName = "GradientText";

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
