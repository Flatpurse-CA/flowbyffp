import type { MetadataRoute } from "next";

const SITE_URL = "https://flow.flatpurse.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/admin",
        "/api",
        "/customer",
        "/onboarding",
        "/staff",
        "/main",
        "/auth",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
