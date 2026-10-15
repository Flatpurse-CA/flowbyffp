import type { Metadata } from "next";
import { getArticle, GUIDES, QUESTIONS, type Article } from "@/lib/seo/articles";
import { FOUNDER, SITE_URL } from "@/lib/seo/facts";
import { seoMetadata } from "@/lib/seo/metadata";
import { SeoShell, SeoCta, Related, faqLd, founderPhotoExists } from "./SeoShell";
import BlockF from "./BlockF";

const BASE = { question: "/questions", guide: "/guides" } as const;
const HUB_LABEL = { question: "Questions", guide: "Guides" } as const;
// When the guides were written, for Article schema.
const PUBLISHED = "2026-10-15";

export function articleParams(kind: Article["kind"]) {
  return (kind === "question" ? QUESTIONS : GUIDES).map(a => ({ slug: a.slug }));
}

export function articleMetadata(kind: Article["kind"], slug: string): Metadata {
  const a = getArticle(kind, slug);
  if (!a) return {};
  return seoMetadata({ title: a.titleTag, description: a.meta, path: `${BASE[kind]}/${a.slug}`, type: kind === "guide" ? "article" : "website" });
}

export function ArticleView({ article: a }: { article: Article }) {
  const url = `${SITE_URL}${BASE[a.kind]}/${a.slug}`;
  const hasPhoto = founderPhotoExists();
  const author = {
    "@type": "Person",
    name: FOUNDER.name,
    jobTitle: "Founder & CEO",
    worksFor: { "@type": "Organization", name: "FlatPurse Inc." },
    ...(hasPhoto ? { image: `${SITE_URL}${FOUNDER.photo}` } : {}),
  };
  const schema = a.kind === "question"
    ? [faqLd([{ q: a.title, a: a.answer }])]
    : [{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: a.title,
        description: a.meta,
        author,
        publisher: { "@type": "Organization", name: "FlatPurse Inc." },
        datePublished: PUBLISHED,
        mainEntityOfPage: url,
      }];

  return (
    <SeoShell
      crumbs={[{ href: "/", label: "Home" }, { href: BASE[a.kind], label: HUB_LABEL[a.kind] }, { href: `${BASE[a.kind]}/${a.slug}`, label: a.title }]}
      schema={schema}
    >
      <h1>{a.title}</h1>
      {a.kind === "guide" && (
        <div className="seo-byline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {hasPhoto && <img src={FOUNDER.photo} alt={FOUNDER.name} />}
          <p>By <strong>{FOUNDER.name}</strong>, {FOUNDER.title}</p>
        </div>
      )}
      {a.kind === "question" ? (
        <div className="seo-answer"><strong>Short answer</strong><p>{a.answer}</p></div>
      ) : (
        <p className="seo-lede">{a.answer}</p>
      )}
      {a.body}
      {a.kind === "guide" && (
        <aside className="seo-bio" aria-label="About the author">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {hasPhoto && <img src={FOUNDER.photo} alt="" />}
          <p><strong>About the author.</strong> {FOUNDER.bio}</p>
        </aside>
      )}
      {a.kind === "question" && <BlockF />}
      <SeoCta />
      <Related links={a.related} />
    </SeoShell>
  );
}
