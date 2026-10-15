import type { Metadata } from "next";
import Hub from "@/components/seo/Hub";
import { CITIES, LOCAL_PAGES } from "@/lib/seo/localPages";
import { SITE_URL } from "@/lib/seo/facts";

export const metadata: Metadata = {
  title: { absolute: "Salon, Spa & Barbershop Software by City | FlatPurse Flow" },
  description: "Booking and payments software for salons, barbershops, spas, massage clinics and studios in Edmonton, Calgary, Saskatoon, Winnipeg, Vancouver and Toronto.",
  alternates: { canonical: `${SITE_URL}/software` },
};

export default function SoftwareHub() {
  return (
    <Hub
      href="/software"
      title="Software by city"
      intro="FlatPurse Flow is built in Edmonton for Canadian salons, barbershops, spas, massage clinics and studios. Pick your city and business."
      groups={CITIES.map(c => ({
        heading: `${c.name}, ${c.province}`,
        links: LOCAL_PAGES.filter(p => p.city.key === c.key).map(p => ({ href: `/${p.slug}`, label: `${p.vertical.label} in ${c.name}` })),
      }))}
    />
  );
}
