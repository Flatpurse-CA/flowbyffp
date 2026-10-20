import type { MetadataRoute } from "next";
import { LOCAL_PAGES } from "@/lib/seo/localPages";
import { GUIDES, QUESTIONS } from "@/lib/seo/articles";

const SITE_URL = "https://flow.flatpurse.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/cookie-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/software`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/questions`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/guides`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/no-show-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/compare/flow-vs-fresha-booksy-vagaro`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...LOCAL_PAGES.map(p => ({ url: `${SITE_URL}/${p.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: p.city.key === "edmonton" ? 0.8 : 0.7 })),
    ...QUESTIONS.map(q => ({ url: `${SITE_URL}/questions/${q.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...GUIDES.map(g => ({ url: `${SITE_URL}/guides/${g.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
