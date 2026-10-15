import type { Metadata } from "next";
import { SITE_URL } from "./facts";

/**
 * Metadata for an SEO page. Setting openGraph/twitter on a page replaces the
 * layout's whole object, which drops the share image and leaves the generic
 * site title on Twitter cards, so both are spelled out here.
 */
export function seoMetadata({ title, description, path, type = "website" }: { title: string; description: string; path: string; type?: "website" | "article" }): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { type, url, siteName: "FlatPurse Flow", title, description, images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [`${SITE_URL}/twitter-image.png`] },
  };
}
