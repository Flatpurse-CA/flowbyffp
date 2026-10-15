import type { NextConfig } from "next";
import path from "node:path";

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const isProd = process.env.NODE_ENV === "production";

// The full source allowlist is enforced in production only: `next dev` needs
// 'unsafe-eval' for its own debugging tooling, which a policy this strict
// would block. Verified before enforcing (browser crawl of every public page,
// plus Stripe's PaymentElement mounted under the policy) with no violations.
// 'unsafe-inline' stays for scripts and styles: Next's inline bootstrap
// scripts and React's inline style props need it, and a nonce-based policy
// would force every page to be dynamically rendered.
const stripe = "https://js.stripe.com https://*.js.stripe.com";
const enforcedCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${stripe} https://connect.facebook.net`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `img-src 'self' data: blob: https: ${supabaseOrigin}`,
  `connect-src 'self' ${supabaseOrigin} ${supabaseOrigin.replace("https://", "wss://")} https://api.stripe.com https://r.stripe.com https://m.stripe.network https://*.facebook.com https://*.facebook.net`,
  `frame-src ${stripe} https://hooks.stripe.com https://m.stripe.network https://drive.google.com https://maps.google.com https://www.google.com`,
  "media-src 'self' blob: https:",
  "worker-src 'self' blob:",
  "form-action 'self' https://checkout.stripe.com https://billing.stripe.com https://connect.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

// In dev, keep only the directives that can't break tooling.
const devCsp = ["frame-ancestors 'none'", "base-uri 'self'", "object-src 'none'"].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://js.stripe.com\")" },
  { key: "Content-Security-Policy", value: isProd ? enforcedCsp : devCsp },
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
