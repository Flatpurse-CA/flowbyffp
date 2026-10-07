import type { NextConfig } from "next";
import path from "node:path";

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

// Enforced: the directives that can't break a page (clickjacking, <base>
// hijacking, plugin embeds). Report-only: the full source allowlist, so any
// third-party origin missed here shows up as a console violation instead of
// breaking Stripe checkout or the pixel. Promote it to enforced once clean.
const enforcedCsp = [
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const reportOnlyCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `img-src 'self' data: blob: https: ${supabaseOrigin}`,
  `connect-src 'self' ${supabaseOrigin} ${supabaseOrigin.replace("https://", "wss://")} https://api.stripe.com https://www.facebook.com`,
  "frame-src https://js.stripe.com https://hooks.stripe.com https://drive.google.com https://maps.google.com https://www.google.com",
  "media-src 'self' blob: https:",
  "worker-src 'self' blob:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://js.stripe.com\")" },
  { key: "Content-Security-Policy", value: enforcedCsp },
  { key: "Content-Security-Policy-Report-Only", value: reportOnlyCsp },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  poweredByHeader: false,
  // Raised from the 1MB default so profile/cover photo uploads (validated
  // server-side up to 5MB in updateShopImage) can actually reach the action.
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
