import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HELD_CITIES, LOCAL_PAGES, PUBLISHED_PAGES, getLocalPage } from "@/lib/seo/localPages";
import { RATES } from "@/lib/seo/facts";
import { seoMetadata } from "@/lib/seo/metadata";
import { SeoShell, SeoCta, Related, FounderQuote, faqLd } from "@/components/seo/SeoShell";
import BlockF from "@/components/seo/BlockF";

// Vertical x city pages, e.g. /salon-software-edmonton. Only the slugs in
// LOCAL_PAGES exist; anything else at the root 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCAL_PAGES.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = getLocalPage((await params).slug);
  if (!page) return {};
  const { vertical, city } = page;
  const meta = seoMetadata({ title: vertical.titleTag(city.name), description: vertical.meta(city.name, city.province), path: `/${page.slug}` });
  // Held cities stay reachable by URL but out of search until published.
  return HELD_CITIES.has(city.key) ? { ...meta, robots: { index: false, follow: true } } : meta;
}

export default async function LocalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getLocalPage(slug);
  if (!page) notFound();
  const { vertical, city } = page;
  const faqs = vertical.faqs(city);

  // Same vertical in other published cities, and other verticals in this city.
  const sameVertical = PUBLISHED_PAGES.filter(p => p.vertical.key === vertical.key && p.city.key !== city.key);
  const sameCity = LOCAL_PAGES.filter(p => p.city.key === city.key && p.vertical.key !== vertical.key);

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FlatPurse Flow",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS",
    description: vertical.meta(city.name, city.province),
    areaServed: { "@type": "City", name: city.name, containedInPlace: { "@type": "AdministrativeArea", name: city.province } },
    offers: { "@type": "Offer", price: "39", priceCurrency: "CAD" },
    publisher: { "@type": "Organization", name: "FlatPurse Inc.", address: { "@type": "PostalAddress", addressLocality: "Edmonton", addressRegion: "AB", addressCountry: "CA" } },
  };

  return (
    <SeoShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/software", label: "Software by city" }, { href: `/${slug}`, label: `${vertical.label} in ${city.name}` }]}
      schema={[softwareLd, faqLd(faqs)]}
    >
      <div className="seo-eyebrow">{vertical.label} · {city.name}, {city.province}</div>
      <h1>{vertical.h1(city.name)}</h1>
      <p className="seo-lede">{vertical.intro(city.name)}</p>

      <h2>What {city.name} {vertical.plural} use Flow for</h2>
      <ul>{vertical.uses.map(u => <li key={u.t}><strong>{u.t}</strong> {u.b}</li>)}</ul>

      <h2>Built for {city.province}</h2>
      <p>{city.tax}</p>
      <p>{city.local[vertical.key]}</p>

      <FounderQuote />

      <h2>No marketplace commission</h2>
      <p>Flow never takes a cut when a new client books you. Card payments are Stripe&apos;s standard rates, paid by your shop: {RATES.tappedCredit} tapped, {RATES.interac} for Interac and {RATES.online} online.</p>

      <h2>Questions {city.name} {vertical.noun} owners ask</h2>
      <dl className="seo-faq">
        {faqs.map(f => <div key={f.q}><dt>{f.q}</dt><dd>{f.a}</dd></div>)}
      </dl>

      <BlockF />
      <SeoCta />

      <Related links={[
        ...sameCity.slice(0, 4).map(p => ({ href: `/${p.slug}`, label: `${p.vertical.label} in ${city.name}` })),
        ...sameVertical.slice(0, 5).map(p => ({ href: `/${p.slug}`, label: `${vertical.label} in ${p.city.name}` })),
        { href: "/questions/reduce-no-shows", label: "How to reduce no-shows" },
        { href: "/questions/gst-on-salon-services", label: "GST on salon services" },
        { href: "/guides/cost-of-no-shows", label: "What a no-show really costs" },
        { href: "/compare/flow-vs-fresha-booksy-vagaro", label: "Flow vs Fresha, Booksy and Vagaro" },
      ]} />
    </SeoShell>
  );
}
