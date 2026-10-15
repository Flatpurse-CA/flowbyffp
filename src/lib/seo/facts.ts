// One set of facts every SEO/AEO page pulls from (AEO Page Pack, Oct 2026),
// limited to what the live app actually does. Change a price or rate here once.

import { PLANS } from "@/lib/plans";
import { TRIAL_DAYS } from "@/lib/dashboard/accessStatus";

export const SITE_URL = "https://flow.flatpurse.com";

const plan = (key: string) => PLANS.find(p => p.key === key)!;

export const PRICES = {
  starter: plan("starter").monthlyPrice!,
  pro: plan("pro").monthlyPrice!,
  proPlus: plan("pro_plus").monthlyPrice!,
};

/** Founders Beta: 40% off year 1, then 25% off for life. */
export const foundersYear1 = (price: number) => (price * 0.6).toFixed(2);
export const foundersAfter = (price: number) => (price * 0.75).toFixed(2);

export const RATES = {
  tappedCredit: "2.7% + 20¢",
  interac: "30¢ flat",
  online: "2.9% + 30¢",
};

export const TRIAL = {
  days: TRIAL_DAYS,
  primary: `Start your free ${TRIAL_DAYS}-day trial`,
  secondary: "Book a 15-minute call with the founder",
  line: "Set up in under a day. We'll move your clients over for you.",
  callHref: "mailto:support@flatpurse.com?subject=15-minute%20call%20with%20the%20founder",
};

export const FOUNDER = {
  name: "George Ogunbande",
  title: "Founder & CEO, FlatPurse Inc.",
  location: "Edmonton, Alberta",
  /** Add the headshot at this path; pages show it only when the file exists. */
  photo: "/george-ogunbande.jpg",
  bio: "George Ogunbande is the founder and CEO of FlatPurse Inc., the Edmonton company behind FlatPurse Flow. Before building Flow, he worked in HR and people analytics. He holds a BA in Labour Studies and Human Resource Management from the University of Windsor and a Wharton People Analytics certificate. He is the author of Small Money Big Brand and runs Builder's Strategist, helping small businesses automate how they win and keep customers.",
  quote: "I built Flow in Edmonton because I watched salon owners lose money to empty chairs and marketplace fees they couldn't see. Flow fills the chair, takes the payment and never takes a cut of a new client.",
};

export const COMPETITOR_CHECK_DATE = "October 9, 2026";

export const SOURCES = {
  stripe: { label: "Stripe pricing, Canada", href: "https://stripe.com/en-ca/pricing" },
  booksy: { label: "Booksy pricing", href: "https://biz.booksy.com/en-us/pricing" },
  fresha: { label: "Fresha pricing", href: "https://www.fresha.com/pricing" },
  vagaro: { label: "Vagaro pricing", href: "https://www.vagaro.com/pricing" },
  square: { label: "Square Canada pricing", href: "https://squareup.com/ca/en/pricing" },
  taxtips: { label: "TaxTips.ca, 2026 sales tax rates", href: "https://www.taxtips.ca/salestaxes/sales-tax-rates-2026.htm" },
  cra: { label: "CRA: when to register for the GST/HST", href: "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/when-register-charge.html" },
  manitoba: { label: "Manitoba RST Bulletin 062", href: "https://www.gov.mb.ca/finance/taxation/pubs/bulletins/062.pdf" },
};
