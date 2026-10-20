import Link from "next/link";
import { SeoShell, SeoCta } from "./SeoShell";

/** Index page that links every page in a cluster, so each is one click from a crawlable hub. */
export default function Hub({ href, title, intro, groups }: { href: string; title: string; intro: string; groups: { heading?: string; id?: string; links: { href: string; label: string }[] }[] }) {
  return (
    <SeoShell crumbs={[{ href: "/", label: "Home" }, { href, label: title }]} schema={[]}>
      <h1>{title}</h1>
      <p className="seo-lede">{intro}</p>
      {groups.map((g, i) => (
        <section key={g.heading ?? i} id={g.id}>
          {g.heading && <h2>{g.heading}</h2>}
          <ul className="seo-hub">{g.links.map(l => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}</ul>
        </section>
      ))}
      <SeoCta />
    </SeoShell>
  );
}
