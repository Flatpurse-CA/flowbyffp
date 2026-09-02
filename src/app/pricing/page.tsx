import { Inter } from "next/font/google";
import LandingNav from "@/components/LandingNav";
import PricingSection from "@/components/PricingSection";
import TestimonialsGrid from "@/components/TestimonialsGrid";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata = {
  title: "Pricing | FlatPurse Flow",
  description:
    "Simple, transparent pricing with zero commission. The first 40 businesses get 40% off Pro or Pro+ for 12 months, then 25% off forever.",
};

export default function PricingPage() {
  return (
    <div className={inter.className} style={{ background: "#000", color: "#342448" }}>
      <LandingNav active="pricing" />

      <PricingSection />

      <TestimonialsGrid />

      <Footer />
    </div>
  );
}
