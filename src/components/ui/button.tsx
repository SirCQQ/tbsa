import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        primary:
          "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        "outline-primary":
          "border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50 hover:border-blue-700 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:hover:border-blue-300 transition-all duration-200",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Colored variants
        blue: "bg-blue-600 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
        green:
          "bg-green-600 text-white shadow-sm hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600",
        purple:
          "bg-purple-600 text-white shadow-sm hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600",
        cyan: "bg-cyan-600 text-white shadow-sm hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600",
        red: "bg-red-600 text-white shadow-sm hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
        orange:
          "bg-orange-600 text-white shadow-sm hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600",
        yellow:
          "bg-yellow-600 text-white shadow-sm hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600",
        pink: "bg-pink-600 text-white shadow-sm hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600",
        indigo:
          "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600",
        emerald:
          "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600",
        teal: "bg-teal-600 text-white shadow-sm hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600",
        violet:
          "bg-violet-600 text-white shadow-sm hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600",
        rose: "bg-rose-600 text-white shadow-sm hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600",
        sky: "bg-sky-600 text-white shadow-sm hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600",
        lime: "bg-lime-600 text-white shadow-sm hover:bg-lime-700 dark:bg-lime-500 dark:hover:bg-lime-600",
        amber:
          "bg-amber-600 text-white shadow-sm hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600",
        // Outline colored variants
        "outline-blue":
          "border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950",
        "outline-green":
          "border border-green-600 text-green-600 bg-transparent hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950",
        "outline-purple":
          "border border-purple-600 text-purple-600 bg-transparent hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-950",
        "outline-cyan":
          "border border-cyan-600 text-cyan-600 bg-transparent hover:bg-cyan-50 dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-cyan-950",
        "outline-red":
          "border border-red-600 text-red-600 bg-transparent hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950",
        "outline-orange":
          "border border-orange-600 text-orange-600 bg-transparent hover:bg-orange-50 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-950",
        "outline-yellow":
          "border border-yellow-600 text-yellow-600 bg-transparent hover:bg-yellow-50 dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-yellow-950",
        "outline-pink":
          "border border-pink-600 text-pink-600 bg-transparent hover:bg-pink-50 dark:border-pink-400 dark:text-pink-400 dark:hover:bg-pink-950",
        "outline-indigo":
          "border border-indigo-600 text-indigo-600 bg-transparent hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950",
        "outline-emerald":
          "border border-emerald-600 text-emerald-600 bg-transparent hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950",
        "outline-teal":
          "border border-teal-600 text-teal-600 bg-transparent hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-950",
        "outline-violet":
          "border border-violet-600 text-violet-600 bg-transparent hover:bg-violet-50 dark:border-violet-400 dark:text-violet-400 dark:hover:bg-violet-950",
        "outline-rose":
          "border border-rose-600 text-rose-600 bg-transparent hover:bg-rose-50 dark:border-rose-400 dark:text-rose-400 dark:hover:bg-rose-950",
        "outline-sky":
          "border border-sky-600 text-sky-600 bg-transparent hover:bg-sky-50 dark:border-sky-400 dark:text-sky-400 dark:hover:bg-sky-950",
        "outline-lime":
          "border border-lime-600 text-lime-600 bg-transparent hover:bg-lime-50 dark:border-lime-400 dark:text-lime-400 dark:hover:bg-lime-950",
        "outline-amber":
          "border border-amber-600 text-amber-600 bg-transparent hover:bg-amber-50 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-950",
        // Gradient variants
        "gradient-primary":
          "bg-gradient-to-r from-primary to-purple-500 text-white shadow-sm hover:from-primary/90 hover:to-purple-500/90",
        "gradient-blue":
          "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm hover:from-blue-600 hover:to-indigo-700",
        "gradient-green":
          "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm hover:from-green-600 hover:to-emerald-700",
        "gradient-purple":
          "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-sm hover:from-purple-600 hover:to-pink-700",
        "gradient-orange":
          "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm hover:from-amber-600 hover:to-orange-700",
        "gradient-cyan":
          "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm hover:from-cyan-600 hover:to-blue-700",
        "gradient-rose":
          "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm hover:from-rose-600 hover:to-pink-700",
        "gradient-sunset":
          "bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 text-white shadow-sm hover:from-orange-500 hover:via-red-600 hover:to-pink-700",
        "gradient-ocean":
          "bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-600 text-white shadow-sm hover:from-blue-500 hover:via-cyan-600 hover:to-teal-700",
        "gradient-forest":
          "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 text-white shadow-sm hover:from-green-500 hover:via-emerald-600 hover:to-teal-700",
        "gradient-aurora":
          "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white shadow-sm hover:from-purple-500 hover:via-pink-600 hover:to-red-600",
        "gradient-twilight":
          "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-sm hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600",
        // Outline gradient variants
        "outline-gradient-primary":
          "border-2 border-transparent bg-gradient-to-r from-primary to-purple-500 bg-clip-border text-transparent bg-clip-text hover:shadow-lg hover:shadow-primary/25",
        "outline-gradient-blue":
          "border-2 border-transparent bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-border text-transparent bg-clip-text hover:shadow-lg hover:shadow-blue-500/25",
        "outline-gradient-green":
          "border-2 border-transparent bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-border text-transparent bg-clip-text hover:shadow-lg hover:shadow-green-500/25",
        "outline-gradient-purple":
          "border-2 border-transparent bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-border text-transparent bg-clip-text hover:shadow-lg hover:shadow-purple-500/25",
        // Glass gradient variants
        "glass-gradient-primary":
          "bg-gradient-to-r from-primary/20 to-purple-500/20 backdrop-blur-md border border-white/20 text-foreground shadow-sm hover:from-primary/30 hover:to-purple-500/30",
        "glass-gradient-blue":
          "bg-gradient-to-r from-blue-500/20 to-indigo-600/20 backdrop-blur-md border border-white/20 text-foreground shadow-sm hover:from-blue-500/30 hover:to-indigo-600/30",
        "glass-gradient-green":
          "bg-gradient-to-r from-green-500/20 to-emerald-600/20 backdrop-blur-md border border-white/20 text-foreground shadow-sm hover:from-green-500/30 hover:to-emerald-600/30",
        "glass-gradient-purple":
          "bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-md border border-white/20 text-foreground shadow-sm hover:from-purple-500/30 hover:to-pink-600/30",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-18",
      },
      borderRadius: {
        default: "rounded-md",
        full: "rounded-full",
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      borderRadius: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, borderRadius, asChild = false, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, borderRadius, className })
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
