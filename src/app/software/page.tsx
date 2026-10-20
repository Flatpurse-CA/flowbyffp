import type { Metadata } from "next";
import Hub from "@/components/seo/Hub";
import { PUBLISHED_CITIES, PUBLISHED_PAGES } from "@/lib/seo/localPages";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({ title: "Salon, Spa & Barbershop Software by City | FlatPurse Flow", description: "Booking and payments software for salons, barbershops, spas, massage clinics and studios in Edmonton, Calgary, Winnipeg, Vancouver and Toronto.", path: "/software" });

export default function SoftwareHub() {
  return (
    <Hub
      href="/software"
      title="Software by city"
      intro="FlatPurse Flow is built in Edmonton for Canadian salons, barbershops, spas, massage clinics and studios. Pick your city and business."
      groups={PUBLISHED_CITIES.map(c => ({
        heading: `${c.name}, ${c.province}`,
        id: c.key,
        links: PUBLISHED_PAGES.filter(p => p.city.key === c.key).map(p => ({ href: `/${p.slug}`, label: `${p.vertical.label} in ${c.name}` })),
      }))}
    />
  );
}
