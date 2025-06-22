import { ButtonsDemo } from "@/components/examples/buttonts-demo";
import { TypographyDemo } from "@/components/examples/typography-demo";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import {
  ExampleOrPermissions,
  ExampleAndPermissions,
  ExampleCombinedPermissions,
  ExampleWithLoading,
  ExampleUsingHook,
  ExampleNestedGuards,
} from "@/components/auth/permission-examples";
import {
  ViewportSizeIndicator,
  ViewportIndicatorTopRight,
  ViewportIndicatorBottomLeft,
  VIEWPORT_POSITIONS,
} from "@/components/ui/viewport-size-indicator";

export default function ExamplesPage() {
  return (
    <>
      <BackgroundGradient className="min-h-screen">
        {/* Viewport Size Indicators with responsive text colors */}
        <ViewportIndicatorTopRight />
        <ViewportIndicatorBottomLeft />
        <ViewportSizeIndicator position={VIEWPORT_POSITIONS.topCenter} />
        <ViewportSizeIndicator
          position={{ bottom: 20, right: 200 }}
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20"
        />

        <div className="container mx-auto py-8">
          <div className="mb-8 p-6 bg-card/50 backdrop-blur-sm rounded-lg border">
            <h1 className="text-3xl font-bold mb-4">
              Examples & Components Demo
            </h1>
            <p className="text-muted-foreground">
              This page demonstrates various UI components including the
              viewport size indicators positioned around the screen. Resize your
              browser to see them update in real-time!
            </p>
          </div>

          <TypographyDemo />
        </div>
        <div className="container mx-auto py-8">
          <ButtonsDemo />
        </div>

        {/* Permission Examples Section */}
        <div className="container mx-auto py-8">
          <div className="mb-8 p-6 bg-card/50 backdrop-blur-sm rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">
              Permission Guard Examples
            </h2>
            <p className="text-muted-foreground mb-4">
              These examples demonstrate the PermissionGuard component with
              different configurations. Note: These examples will show fallback
              content unless you have the required permissions in your session.
            </p>
          </div>

          <div className="grid gap-8">
            <ExampleOrPermissions />
            <ExampleAndPermissions />
            <ExampleCombinedPermissions />
            <ExampleWithLoading />
            <ExampleUsingHook />
            <ExampleNestedGuards />
          </div>
        </div>
      </BackgroundGradient>
    </>
  );
}

export const metadata = {
  title: "Examples - TBSA Components",
  description:
    "Component examples including typography, buttons, and permission guards for TBSA",
};
