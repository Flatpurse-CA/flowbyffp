import { Inter } from "next/font/google";
import Home4Landing from "./Home4Landing";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-inter" });

export default function Home4Page() {
  return (
    <div className={inter.variable}>
      <Home4Landing />
    </div>
  );
}
