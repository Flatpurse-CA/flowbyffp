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

const SITE_URL = "https://flow.flatpurse.com";
const SITE_DESCRIPTION =
  "The AI-powered booking and client management platform built for salons and stylists.";

export const metadata: Metadata = {
  // Link previews need absolute image URLs; without this they resolve to localhost
  metadataBase: new URL(SITE_URL),
  title: "FlatPurse Flow",
  description: SITE_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Flow",
  },
  icons: {
    apple: "/icon-192.png",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "FlatPurse Flow",
    title: "FlatPurse Flow",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "FlatPurse Flow",
    description: SITE_DESCRIPTION,
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
