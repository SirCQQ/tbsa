import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const pageVariants = cva("min-h-screen w-full", {
  variants: {
    display: {
      block: "block",
      flex: "flex",
      "flex-col": "flex flex-col",
      "flex-row": "flex flex-row",
      grid: "grid",
      "inline-block": "inline-block",
      "inline-flex": "inline-flex",
      hidden: "hidden",
    },
    margin: {
      none: "",
      xs: "m-1",
      sm: "m-2",
      md: "m-4",
      lg: "m-6",
      xl: "m-8",
      "2xl": "m-12",
      auto: "m-auto",
      // Directional margins
      "x-auto": "mx-auto",
      "y-auto": "my-auto",
      "t-auto": "mt-auto",
      "b-auto": "mb-auto",
      "l-auto": "ml-auto",
      "r-auto": "mr-auto",
    },
    padding: {
      none: "",
      xs: "p-1",
      sm: "p-2",
      md: "p-4",
      lg: "p-6",
      xl: "p-8",
      "2xl": "p-12",
      "3xl": "p-16",
      "4xl": "p-20",
      "5xl": "p-24",
      // Directional padding
      "x-sm": "px-2",
      "x-md": "px-4",
      "x-lg": "px-6",
      "x-xl": "px-8",
      "x-2xl": "px-12",
      "y-sm": "py-2",
      "y-md": "py-4",
      "y-lg": "py-6",
      "y-xl": "py-8",
      "y-2xl": "py-12",
      // Common page padding combinations
      "page-sm": "px-4 py-6",
      "page-md": "px-6 py-8",
      "page-lg": "px-8 py-12",
      "page-xl": "px-12 py-16",
    },
    container: {
      none: "",
      sm: "max-w-sm mx-auto",
      md: "max-w-md mx-auto",
      lg: "max-w-lg mx-auto",
      xl: "max-w-xl mx-auto",
      "2xl": "max-w-2xl mx-auto",
      "3xl": "max-w-3xl mx-auto",
      "4xl": "max-w-4xl mx-auto",
      "5xl": "max-w-5xl mx-auto",
      "6xl": "max-w-6xl mx-auto",
      "7xl": "max-w-7xl mx-auto",
      full: "max-w-full",
      screen: "max-w-screen-xl mx-auto",
    },
    background: {
      none: "",
      default: "bg-background",
      muted: "bg-muted",
      card: "bg-card",
      popover: "bg-popover",
      primary: "bg-primary",
      secondary: "bg-secondary",
      accent: "bg-accent",
      destructive: "bg-destructive",
      // Simple gradients
      "gradient-subtle":
        "bg-gradient-to-br from-background via-muted/30 to-background",
      "gradient-primary":
        "bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5",
      "gradient-secondary":
        "bg-gradient-to-br from-secondary/5 via-secondary/10 to-secondary/5",
      // Directional gradients
      "gradient-to-t": "bg-gradient-to-t from-muted/20 to-background",
      "gradient-to-b": "bg-gradient-to-b from-background to-muted/30",
      "gradient-to-l": "bg-gradient-to-l from-muted/20 to-background",
      "gradient-to-r": "bg-gradient-to-r from-background to-muted/20",
      // Sophisticated color gradients
      "gradient-dawn":
        "bg-gradient-to-br from-orange-50/30 via-pink-50/20 to-purple-50/30 dark:from-orange-950/20 dark:via-pink-950/10 dark:to-purple-950/20",
      "gradient-ocean":
        "bg-gradient-to-br from-blue-50/40 via-cyan-50/30 to-teal-50/40 dark:from-blue-950/30 dark:via-cyan-950/20 dark:to-teal-950/30",
      "gradient-forest":
        "bg-gradient-to-br from-green-50/40 via-emerald-50/30 to-teal-50/40 dark:from-green-950/30 dark:via-emerald-950/20 dark:to-teal-950/30",
      "gradient-sunset":
        "bg-gradient-to-br from-amber-50/40 via-orange-50/30 to-red-50/40 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-red-950/30",
      "gradient-lavender":
        "bg-gradient-to-br from-purple-50/40 via-violet-50/30 to-indigo-50/40 dark:from-purple-950/30 dark:via-violet-950/20 dark:to-indigo-950/30",
      "gradient-rose":
        "bg-gradient-to-br from-rose-50/40 via-pink-50/30 to-red-50/40 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-red-950/30",
      // Radial gradients
      "gradient-radial-center":
        "bg-radial-gradient from-primary/10 via-background to-muted/20",
      "gradient-radial-subtle":
        "bg-gradient-radial from-muted/20 at-center to-background",
      // Multi-directional sophisticated gradients
      "gradient-aurora":
        "bg-gradient-to-br from-purple-50/30 via-pink-50/20 via-blue-50/25 to-cyan-50/30 dark:from-purple-950/20 dark:via-pink-950/10 dark:via-blue-950/15 dark:to-cyan-950/20",
      "gradient-northern":
        "bg-gradient-to-br from-indigo-50/40 via-blue-50/30 via-cyan-50/25 to-teal-50/35 dark:from-indigo-950/30 dark:via-blue-950/20 dark:via-cyan-950/15 dark:to-teal-950/25",
      "gradient-cosmic":
        "bg-gradient-to-br from-violet-50/35 via-purple-50/25 via-indigo-50/30 to-blue-50/35 dark:from-violet-950/25 dark:via-purple-950/15 dark:via-indigo-950/20 dark:to-blue-950/25",
      // Animated gradients (subtle animation)
      "gradient-wave":
        "bg-gradient-to-r from-blue-50/30 via-cyan-50/40 via-blue-50/30 to-cyan-50/40 dark:from-blue-950/20 dark:via-cyan-950/30 dark:via-blue-950/20 dark:to-cyan-950/30 bg-[length:200%_100%] animate-gradient-x",
      "gradient-pulse":
        "bg-gradient-to-br from-primary/5 via-primary/15 to-primary/5 bg-[length:200%_200%] animate-gradient-xy",
      // Glass morphism gradients
      "gradient-glass":
        "bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-3xl dark:from-white/5 dark:via-white/10 dark:to-white/5",
      "gradient-glass-warm":
        "bg-gradient-to-br from-orange-100/10 via-yellow-100/15 to-orange-100/10 backdrop-blur-2xl dark:from-orange-900/10 dark:via-yellow-900/15 dark:to-orange-900/10",
      "gradient-glass-cool":
        "bg-gradient-to-br from-blue-100/10 via-cyan-100/15 to-blue-100/10 backdrop-blur-2xl dark:from-blue-900/10 dark:via-cyan-900/15 dark:to-blue-900/10",
    },
    justifyContent: {
      none: "",
      start: "justify-start",
      end: "justify-end",
      center: "justify-center",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
      stretch: "justify-stretch",
    },
    alignItems: {
      none: "",
      start: "items-start",
      end: "items-end",
      center: "items-center",
      baseline: "items-baseline",
      stretch: "items-stretch",
    },
  },
  defaultVariants: {
    display: "block",
    margin: "none",
    padding: "none",
    container: "none",
    background: "default",
    justifyContent: "none",
    alignItems: "none",
  },
});

export interface PageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageVariants> {
  asChild?: boolean;
}

const Page = React.forwardRef<HTMLDivElement, PageProps>(
  (
    {
      className,
      display,
      margin,
      padding,
      container,
      background,
      justifyContent,
      alignItems,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        className={cn(
          pageVariants({
            display,
            margin,
            padding,
            container,
            background,
            justifyContent,
            alignItems,
            className,
          })
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Page.displayName = "Page";

export { Page, pageVariants };
