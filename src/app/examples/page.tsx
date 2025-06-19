import { TypographyDemo } from "@/components/examples/typography-demo";
import { BackgroundGradient } from "@/components/ui/background-gradient";

export default function ExamplesPage() {
  return (
    <BackgroundGradient className="min-h-screen">
      <div className="container mx-auto py-8">
        <TypographyDemo />
      </div>
    </BackgroundGradient>
  );
}

export const metadata = {
  title: "Examples - TBSA Typography",
  description: "Typography component examples and usage patterns for TBSA",
};
