import type { Metadata } from "next";
import { Inter } from "next/font/google";
import DemoFunnel from "./DemoFunnel";
import "./demo.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "See Flow in action | FlatPurse Flow",
  description: "Watch a walkthrough of FlatPurse Flow, booking, payments and AI follow-ups for salons and barbershops.",
};

export default function DemoPage() {
  return (
    <main className={`demo-page ${inter.className}`}>
      <DemoFunnel />
    </main>
  );
}
