import type { Metadata } from "next";
import Home5Page from "./home-5/page";
import { SITE_URL } from "@/lib/seo/facts";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({
  title: "Salon & Barbershop Booking Software in Canada | FlatPurse Flow",
  description: "Online booking, Tap to Pay and Interac, and AI that recovers no-shows and fills empty chairs. Built in Edmonton for Canadian salons, barbershops and spas. No commission on new clients.",
  path: "/",
});

const SITE_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FlatPurse Inc.",
    alternateName: "FlatPurse Flow",
    url: SITE_URL,
    logo: `${SITE_URL}/icon-192.png`,
    founder: { "@type": "Person", name: "George Ogunbande" },
    address: { "@type": "PostalAddress", addressLocality: "Edmonton", addressRegion: "AB", addressCountry: "CA" },
    sameAs: ["https://www.instagram.com/flatpurse/", "https://www.facebook.com/flatpurse/", "https://ca.linkedin.com/company/flatpurse"],
  },
  { "@context": "https://schema.org", "@type": "WebSite", name: "FlatPurse Flow", url: SITE_URL },
];

export default function HomePage() {
  return (
    <>
      <Home5Page />
      {SITE_LD.map((d, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, "\\u003c") }} />)}
    </>
  );
}
