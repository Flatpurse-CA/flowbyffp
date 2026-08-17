import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-context";
import CookieBanner from "@/components/CookieBanner";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import MetaPixel from "@/components/MetaPixel";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlatPurse Flow",
  description: "The AI-powered booking and client management platform built for salons and stylists.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Flow",
  },
  icons: {
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#712AE2",
  // Lets content actually extend under the iOS status bar/notch instead of being
  // letterboxed by it — without this, every env(safe-area-inset-*) below evaluates
  // to 0 and backgrounds/gradients get a hard edge instead of flowing full-bleed.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Inline script runs before paint — sets data-theme from localStorage with no flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ffp-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}})()`,
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
        <CookieBanner />
        <ServiceWorkerRegister />
        <MetaPixel />
      </body>
    </html>
  );
}
