// Public SEO links shown in the header Resources menu and the footer. Kept
// free of page copy so the client-side nav doesn't ship every page's text.

export type SiteLink = { href: string; label: string };
export type CityKey = "edmonton" | "calgary" | "saskatoon" | "winnipeg" | "vancouver" | "toronto";

// Cities whose pages stay reachable by URL but are kept out of the sitemap,
// hubs, menus and cross-links and marked noindex until they're ready.
// Saskatoon: waiting on confirmation of PST on salon services (PST-46).
// Remove a city from this set to publish its pages everywhere.
export const HELD_CITIES: ReadonlySet<CityKey> = new Set<CityKey>(["saskatoon"]);

const CITY_NAMES: Record<CityKey, string> = {
  edmonton: "Edmonton", calgary: "Calgary", saskatoon: "Saskatoon",
  winnipeg: "Winnipeg", vancouver: "Vancouver", toronto: "Toronto",
};

export const CITY_LINKS: SiteLink[] = (Object.keys(CITY_NAMES) as CityKey[])
  .filter(k => !HELD_CITIES.has(k))
  .map(k => ({ href: `/software#${k}`, label: CITY_NAMES[k] }));

// Business types link to the Edmonton page (home market); each page links on
// to the same business type in the other cities.
export const BUSINESS_LINKS: SiteLink[] = [
  { href: "/salon-software-edmonton", label: "Salons" },
  { href: "/barbershop-software-edmonton", label: "Barbershops" },
  { href: "/spa-software-edmonton", label: "Spas" },
  { href: "/massage-clinic-software-edmonton", label: "Massage clinics" },
  { href: "/tattoo-studio-software-edmonton", label: "Tattoo & nail studios" },
];

export const LEARN_LINKS: SiteLink[] = [
  { href: "/guides/cost-of-no-shows", label: "What a no-show really costs" },
  { href: "/guides/salon-sales-tax-canada", label: "Salon sales tax by province" },
  { href: "/guides/marketplace-commission-cost", label: "Marketplace commission costs" },
  { href: "/guides/canadian-salon-software", label: "Choosing salon software" },
  { href: "/questions", label: "Salon owner questions" },
];

export const TOOL_LINKS: SiteLink[] = [
  { href: "/no-show-calculator", label: "No-show cost calculator" },
  { href: "/compare/flow-vs-fresha-booksy-vagaro", label: "Flow vs Fresha, Booksy, Vagaro" },
  { href: "/software", label: "All cities" },
  { href: "/guides", label: "All guides" },
];

export const RESOURCE_GROUPS: { heading: string; links: SiteLink[] }[] = [
  { heading: "By city", links: CITY_LINKS },
  { heading: "By business", links: BUSINESS_LINKS },
  { heading: "Learn", links: LEARN_LINKS },
  { heading: "Tools", links: TOOL_LINKS },
];
