import type { Metadata } from "next";
import Hub from "@/components/seo/Hub";
import { GUIDES } from "@/lib/seo/articles";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({ title: "Guides for Canadian Salon Owners | FlatPurse Flow", description: "First-hand guides from the team that built FlatPurse Flow: no-show costs, sales tax in every province, marketplace commissions and choosing software.", path: "/guides" });

export default function GuidesHub() {
  return (
    <Hub
      href="/guides"
      title="Guides"
      intro="First-hand guides from the team that built FlatPurse Flow in Edmonton."
      groups={[{ links: GUIDES.map(g => ({ href: `/guides/${g.slug}`, label: g.title })) }]}
    />
  );
}
