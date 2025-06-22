import { ButtonsDemo } from "@/components/examples/buttonts-demo";
import { TypographyDemo } from "@/components/examples/typography-demo";
import { Header } from "@/components/landing/header";
import { BackgroundGradient } from "@/components/ui/background-gradient";
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
      </BackgroundGradient>
    </>
  );
}

export const metadata = {
  title: "Examples - TBSA Typography",
  description: "Typography component examples and usage patterns for TBSA",
};
