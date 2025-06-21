"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Position = {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
};

type ViewportSizeIndicatorProps = {
  position?: Position;
  className?: string;
};

export function ViewportSizeIndicator({
  position = { top: "1rem", right: "1rem" },
  className,
}: ViewportSizeIndicatorProps) {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewport({ width, height });
    };

    // Initial call
    updateViewport();

    // Add event listener
    window.addEventListener("resize", updateViewport);

    // Cleanup
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Convert position values to CSS strings
  const positionStyles: React.CSSProperties = {};
  if (position.top !== undefined) {
    positionStyles.top =
      typeof position.top === "number" ? `${position.top}px` : position.top;
  }
  if (position.right !== undefined) {
    positionStyles.right =
      typeof position.right === "number"
        ? `${position.right}px`
        : position.right;
  }
  if (position.bottom !== undefined) {
    positionStyles.bottom =
      typeof position.bottom === "number"
        ? `${position.bottom}px`
        : position.bottom;
  }
  if (position.left !== undefined) {
    positionStyles.left =
      typeof position.left === "number" ? `${position.left}px` : position.left;
  }

  const baseClasses = cn(
    "fixed z-50 pointer-events-none select-none",
    "backdrop-blur-sm border rounded-lg shadow-lg",
    "px-3 py-2 text-xs font-mono font-bold",
    "transition-all duration-200",
    // Light/dark mode styling with Tailwind dark: prefix
    "bg-white/90 text-gray-900 border-gray-200",
    "dark:bg-gray-900/90 dark:text-white dark:border-gray-700",
    className
  );

  return (
    <div
      className={cn(
        baseClasses,
        // Responsive text colors based on viewport size
        // Light mode colors
        "text-red-500", // XS: < 640px - Red
        "sm:text-orange-500", // SM: 640px+ - Orange
        "md:text-yellow-500", // MD: 768px+ - Yellow
        "lg:text-green-500", // LG: 1024px+ - Green
        "xl:text-blue-500", // XL: 1280px+ - Blue
        // Dark mode colors (lighter variants for better contrast)
        "dark:text-red-400", // XS: < 640px - Light Red
        "sm:dark:text-orange-400", // SM: 640px+ - Light Orange
        "md:dark:text-yellow-400", // MD: 768px+ - Light Yellow
        "lg:dark:text-green-400", // LG: 1024px+ - Light Green
        "xl:dark:text-blue-400" // XL: 1280px+ - Light Blue
      )}
      style={positionStyles}
    >
      {/* Content changes based on breakpoint */}
      <span className="block sm:hidden">
        XS: {viewport.width} × {viewport.height}
      </span>
      <span className="hidden sm:block md:hidden">
        SM: {viewport.width} × {viewport.height}
      </span>
      <span className="hidden md:block lg:hidden">
        MD: {viewport.width} × {viewport.height}
      </span>
      <span className="hidden lg:block xl:hidden">
        LG: {viewport.width} × {viewport.height}
      </span>
      <span className="hidden xl:block">
        XL: {viewport.width} × {viewport.height}
      </span>
    </div>
  );
}

// Preset position configurations
export const VIEWPORT_POSITIONS = {
  topLeft: { top: "1rem", left: "1rem" },
  topRight: { top: "1rem", right: "1rem" },
  topCenter: { top: "1rem", left: "50%", transform: "translateX(-50%)" },
  bottomLeft: { bottom: "1rem", left: "1rem" },
  bottomRight: { bottom: "1rem", right: "1rem" },
  bottomCenter: { bottom: "1rem", left: "50%", transform: "translateX(-50%)" },
  centerLeft: { top: "50%", left: "1rem", transform: "translateY(-50%)" },
  centerRight: { top: "50%", right: "1rem", transform: "translateY(-50%)" },
} as const;

// Quick preset components
export const ViewportIndicatorTopRight = (
  props?: Omit<ViewportSizeIndicatorProps, "position">
) => (
  <ViewportSizeIndicator position={VIEWPORT_POSITIONS.topRight} {...props} />
);

export const ViewportIndicatorTopLeft = (
  props?: Omit<ViewportSizeIndicatorProps, "position">
) => <ViewportSizeIndicator position={VIEWPORT_POSITIONS.topLeft} {...props} />;

export const ViewportIndicatorBottomRight = (
  props?: Omit<ViewportSizeIndicatorProps, "position">
) => (
  <ViewportSizeIndicator position={VIEWPORT_POSITIONS.bottomRight} {...props} />
);

export const ViewportIndicatorBottomLeft = (
  props?: Omit<ViewportSizeIndicatorProps, "position">
) => (
  <ViewportSizeIndicator position={VIEWPORT_POSITIONS.bottomLeft} {...props} />
);
