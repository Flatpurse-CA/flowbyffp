import { Inter } from "next/font/google";
import LandingNav from "@/components/LandingNav";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata = {
  title: "Pricing | FlatPurse Flow",
  description:
    "Simple, transparent pricing with zero commission. The first 40 businesses get Founders pricing: at least 25% off every plan, locked in while they stay subscribed.",
};

export default function PricingPage() {
  return (
    <div className={inter.className} style={{ background: "#000", color: "#342448" }}>
      <LandingNav active="pricing" variant="v2" />

      <PricingSection />

      <Footer />
    </div>
  );
}
