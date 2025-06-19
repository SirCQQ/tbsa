import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { AboutSection } from "@/components/landing/about-section";
import { SubscriptionSection } from "@/components/landing/subscription-section";
import { ContactSection } from "@/components/landing/contact-section";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <AboutSection />
        <SubscriptionSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
