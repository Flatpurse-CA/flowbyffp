import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { Arrow } from "@/app/home-4/H4Chrome";
import { Inter } from "next/font/google";
import LandingNav from "@/components/LandingNav";
import Footer from "@/components/Footer";
import { FOUNDER, SITE_URL, TRIAL } from "@/lib/seo/facts";
import "@/app/home-4/home-4.css";
import "./seo.css";

// Same nav and font as the homepage, pricing and features pages.
const navFont = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export type Crumb = { href: string; label: string };

function JsonLd({ data }: { data: object }) {
  // JSON.stringify output can't close the script tag, but "<" is escaped anyway.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: `${SITE_URL}${c.href}` })),
  };
}

export function faqLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/** True once the founder headshot has been added to /public. */
export function founderPhotoExists(): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", FOUNDER.photo));
  } catch {
    return false;
  }
}

export function SeoShell({ crumbs, schema, children }: { crumbs: Crumb[]; schema: object[]; children: React.ReactNode }) {
  return (
    <>
      <div className="h4-page" data-audience="page">
        <a className="skip" href="#main">Skip to content</a>
        <div className={navFont.className}><LandingNav active="" /></div>
        <main id="main">
          <article className="seo">
            <nav className="seo-crumbs" aria-label="Breadcrumb">
              {crumbs.map((c, i) => (
                <span key={c.href}>
                  {i < crumbs.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
                  {i < crumbs.length - 1 && <span aria-hidden="true"> / </span>}
                </span>
              ))}
            </nav>
            {children}
          </article>
        </main>
        {[breadcrumbLd(crumbs), ...schema].map((d, i) => <JsonLd key={i} data={d} />)}
      </div>
      <Footer />
    </>
  );
}

export function SeoCta() {
  return (
    <section className="seo-cta" aria-label="Get started">
      <div className="seo-cta-actions">
        <Link className="button" href="/signup">{TRIAL.primary} <Arrow /></Link>
        <a className="ghost" href={TRIAL.callHref}>{TRIAL.secondary}</a>
      </div>
      <p>No card required. Full Pro+ access during the trial. {TRIAL.line}</p>
    </section>
  );
}

export function Related({ links }: { links: Crumb[] }) {
  if (!links.length) return null;
  return (
    <nav className="seo-related" aria-label="Related pages">
      <h2>Related</h2>
      <ul>{links.map(l => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}</ul>
    </nav>
  );
}

export function FounderQuote() {
  return (
    <blockquote>
      <p>&ldquo;{FOUNDER.quote}&rdquo;</p>
      <cite>{FOUNDER.name}, Founder, FlatPurse Flow</cite>
    </blockquote>
  );
}
