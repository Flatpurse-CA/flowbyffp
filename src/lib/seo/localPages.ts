// Vertical x city pages (AEO Page Pack step 1). Each city carries its own tax
// treatment and local paragraph per vertical so no two pages are the same copy
// with the name swapped. Only features the live app has are described.

import type { ProvinceCode } from "@/lib/tax";
import { PRICES, RATES } from "./facts";

export type VerticalKey = "salon" | "barbershop" | "spa" | "massage-clinic" | "tattoo-studio";
export type CityKey = "edmonton" | "calgary" | "saskatoon" | "winnipeg" | "vancouver" | "toronto";

export type Faq = { q: string; a: string };
export type Use = { t: string; b: string };

export type City = {
  key: CityKey;
  name: string;
  province: string;
  provinceCode: ProvinceCode;
  /** Tax paragraph for the "Built for <province>" section. */
  tax: string;
  /** Short tax answer for FAQs and meta. */
  taxShort: string;
  /** One unique local paragraph per vertical. */
  local: Record<VerticalKey, string>;
};

export type Vertical = {
  key: VerticalKey;
  slugPrefix: string;
  /** "salon", "barbershop" ... used mid-sentence. */
  noun: string;
  /** "salons", "barbershops" ... */
  plural: string;
  /** "stylist", "barber", "therapist", "artist" */
  staff: string;
  label: string;
  titleTag: (city: string) => string;
  meta: (city: string, province: string) => string;
  h1: (city: string) => string;
  intro: (city: string) => string;
  uses: Use[];
  faqs: (c: City) => Faq[];
};

const NO_TAX_ON_DEPOSIT = "Deposits aren't taxed; tax is charged on the final bill.";

export const CITIES: City[] = [
  {
    key: "edmonton", name: "Edmonton", province: "Alberta", provinceCode: "AB",
    tax: `Alberta charges 5% GST and no provincial sales tax. Flow applies it to every final bill automatically and records it for your GST/HST return. ${NO_TAX_ON_DEPOSIT} Client records are stored in Canada, prices are in CAD, and support is right here in Edmonton.`,
    taxShort: "5% GST, no PST",
    local: {
      salon: "From Whyte Avenue and 124 Street to Sherwood Park and St. Albert, Edmonton salons juggle walk-in curiosity, long colour appointments and a winter that empties chairs the moment the roads get bad. Flow was built down the road from them, so the no-show math it runs on is Edmonton math.",
      barbershop: "Whether you cut on Jasper Avenue, in Mill Woods or out in Sherwood Park, Edmonton barbers live on regulars who come back every two to four weeks. Flow keeps those chairs full without paying a booking app for every new client who finds you.",
      spa: "Edmonton spas from Old Strathcona to the west end sell time in a treatment room, and a cancelled 90-minute facial on a February afternoon is hard to resell. Flow offers that slot to clients who asked for an earlier time before the hour is lost.",
      "massage-clinic": "Massage clinics across Edmonton, from downtown to Windermere, see clients on treatment plans that slip as soon as one session is missed. Flow follows up on the miss and reminds clients when their next session is due.",
      "tattoo-studio": "Edmonton's tattoo and nail studios, from the Whyte Avenue strip to Kingsway, lose the most when a long session falls through. Flow collects deposits by payment link and offers a cancelled session to the people waiting for one.",
    },
  },
  {
    key: "calgary", name: "Calgary", province: "Alberta", provinceCode: "AB",
    tax: `Calgary businesses charge 5% GST and no provincial sales tax. Flow applies it on every final bill and records it for your GST/HST return. ${NO_TAX_ON_DEPOSIT} Pricing is in CAD and client records stay in Canada.`,
    taxShort: "5% GST, no PST",
    local: {
      salon: "Calgary salons on 17th Avenue SW, in Kensington and along Inglewood's 9th Avenue compete for the same busy professionals. When one of them cancels at noon, Flow offers the opening to clients who wanted an earlier time, so the afternoon stays booked.",
      barbershop: "Calgary barbershops from Kensington to Inglewood run on loyalty, and Stampede season can make or break a month. Flow nudges each regular when they're due for a cut, so the slow weeks around it fill too.",
      spa: "Calgary's spas, from the Beltline to the day spas near 17th Avenue SW, book long treatments days ahead. Flow reminds clients before they arrive and, if someone cancels, offers the treatment slot to people waiting for one.",
      "massage-clinic": "Calgary massage clinics in Kensington, Inglewood and the suburbs see a lot of office and sports injury work on recurring plans. Flow reminds clients when their next session is due and follows up on missed ones within the hour.",
      "tattoo-studio": "Calgary tattoo and nail studios along 17th Avenue SW and in Inglewood book consults weeks out. Flow sends a payment link to lock in a session and offers any cancellation to the clients who asked to be told.",
    },
  },
  {
    key: "saskatoon", name: "Saskatoon", province: "Saskatchewan", provinceCode: "SK",
    tax: `Saskatchewan businesses charge 5% GST. Provincial sales tax is 6%: it applies to retail products, and whether it applies to a service depends on the service, so Flow lets you choose whether to charge PST on services. ${NO_TAX_ON_DEPOSIT} Check Saskatchewan's PST bulletins or your accountant for your own services.`,
    taxShort: "5% GST, plus 6% PST on retail and on some services",
    local: {
      salon: "Flow was built on the Prairies, a few hours west of Broadway Avenue. Saskatoon salons downtown, on Broadway and out in Stonebridge know a quiet Tuesday costs as much as a busy Saturday earns, and Flow's AutoPilot is built to fill those quiet hours.",
      barbershop: "Built on the Prairies for shops like the ones on Broadway and in Stonebridge, Flow keeps a Saskatoon barbershop's regulars on schedule and rebooks no-shows without the owner chasing anyone.",
      spa: "Saskatoon spas downtown and in Stonebridge serve a city where people book self-care around long winters. Flow, built on the Prairies, sends birthday offers and fills cancelled treatments so the calendar stays steady.",
      "massage-clinic": "Saskatoon massage clinics on Broadway and downtown keep clients on treatment plans through farm season and hockey season alike. Flow, built on the Prairies, reminds them when the next session is due.",
      "tattoo-studio": "Saskatoon tattoo and nail studios on Broadway and downtown book long sessions in a smaller market where every cancellation hurts. Flow collects deposits by payment link and fills cancelled sessions from your list.",
    },
  },
  {
    key: "winnipeg", name: "Winnipeg", province: "Manitoba", provinceCode: "MB",
    tax: "Manitoba businesses charge 5% GST. Manitoba's 7% RST no longer applies to hair care, skin care, spa services or massage therapy (Bulletin 062), but it still applies to retail products and to tanning. Flow charges GST on services and RST only where it applies. Deposits aren't taxed; tax is charged on the final bill.",
    taxShort: "5% GST; RST doesn't apply to hair, skin, spa or massage services",
    local: {
      salon: "Built on the Prairies for salons like the ones in Osborne Village, the Exchange District and along Corydon Avenue, Flow helps a Winnipeg salon keep chairs full through a winter that cancels appointments for it.",
      barbershop: "Winnipeg barbershops in Osborne Village, the Exchange and on Corydon live on regulars. Flow, built on the Prairies, reminds each one when they're due and rebooks the ones who miss.",
      spa: "Winnipeg spas from the Exchange District to Corydon Avenue can now sell services without RST, which makes clean GST-only receipts matter. Flow, built on the Prairies, handles the tax and fills cancelled treatments.",
      "massage-clinic": "Winnipeg massage clinics in Osborne Village and along Corydon no longer charge RST on massage therapy. Flow, built on the Prairies, charges the GST, keeps clients on their treatment plans and follows up on missed sessions.",
      "tattoo-studio": "Winnipeg tattoo and nail studios in the Exchange District and Osborne Village book long, high-value sessions. Flow collects deposits by payment link and offers cancellations to the clients waiting for an opening.",
    },
  },
  {
    key: "vancouver", name: "Vancouver", province: "British Columbia", provinceCode: "BC",
    tax: `British Columbia businesses charge 5% GST. BC's 7% PST applies to retail products; most personal services aren't subject to PST, so Flow charges it on products and lets you turn it on for services if it applies to yours. ${NO_TAX_ON_DEPOSIT} Confirm each service with your accountant.`,
    taxShort: "5% GST, plus 7% PST on retail products",
    local: {
      salon: "Vancouver salons in Kitsilano, on Main Street and in Gastown pay some of the highest rents in the country, so a marketplace fee on every new client adds up fast. Flow never takes a commission on a new client, and it fills cancelled chairs on its own.",
      barbershop: "Vancouver barbershops from Main Street to Gastown often get new clients through booking marketplaces that charge for each one. Flow doesn't. It keeps your regulars on schedule and rebooks no-shows without taking a cut.",
      spa: "Vancouver spas in Kitsilano and Gastown sell premium treatments where a marketplace commission on a first visit can run to dozens of dollars. Flow charges none, and fills cancelled treatments from your own client list.",
      "massage-clinic": "Vancouver massage clinics on Main Street and in Kitsilano keep clients on recurring treatment plans. Flow takes no commission on new clients, reminds existing ones when their next session is due, and follows up on missed ones.",
      "tattoo-studio": "Vancouver tattoo and nail studios in Gastown and on Main Street book long sessions where a marketplace cut on the first visit hurts. Flow takes none, and collects deposits by payment link.",
    },
  },
  {
    key: "toronto", name: "Toronto", province: "Ontario", provinceCode: "ON",
    tax: `Ontario businesses charge 13% HST on services and products. Flow applies it to every final bill and records it for your GST/HST return. ${NO_TAX_ON_DEPOSIT} Pricing is in CAD and client records stay in Canada.`,
    taxShort: "13% HST",
    local: {
      salon: "Toronto salons on Queen West, in Yorkville and in Leslieville run full books where one no-show a day is real money. Flow's AutoPilot sends a rebook message about an hour after a miss, offers the gap to clients who want it, and shows you what it recovered.",
      barbershop: "Toronto barbershops from Queen West to Leslieville compete hard for regulars. Flow reminds each client when they're due, rebooks no-shows automatically, and never charges a commission when a new client books you.",
      spa: "Toronto spas in Yorkville and on Queen West sell long, high-value treatments. AutoPilot fills a cancelled slot from your list, sends birthday offers and wins back clients who haven't returned, then shows the revenue it brought in.",
      "massage-clinic": "Toronto massage clinics in Leslieville, on Queen West and in Yorkville run on recurring treatment plans. Flow reminds clients when their next session is due and follows up on missed ones automatically.",
      "tattoo-studio": "Toronto tattoo and nail studios on Queen West and in Leslieville book consults and long sessions weeks out. Flow collects deposits by payment link and offers cancellations to clients waiting for an opening, with no commission on new clients.",
    },
  },
];

const priceFaq: Faq = {
  q: "How much does it cost?",
  a: `Plans start at CAD ${PRICES.starter}/month. Founders Beta members save 40% in year 1 and 25% for life after that. Every plan starts with a free 14-day trial of Pro+, no card required.`,
};
const switchFaq: Faq = {
  q: "Can I move my clients from Fresha, Vagaro or Booksy?",
  a: "Yes. We import your clients for you, and most shops are running in under a day.",
};
const readerFaq: Faq = {
  q: "Do I need a card terminal?",
  a: `No. Tap to Pay works on a compatible iPhone: ${RATES.tappedCredit} per tapped credit card and ${RATES.interac} for Interac.`,
};
const canadaFaq = (c: City): Faq => ({
  q: "Is Flow made in Canada?",
  a: `Yes. FlatPurse Inc. is based in Edmonton, Alberta, client records are stored in Canada, and Flow handles ${c.province} sales tax (${c.taxShort}).`,
});

export const VERTICALS: Vertical[] = [
  {
    key: "salon", slugPrefix: "salon-software", noun: "salon", plural: "salons", staff: "stylist", label: "Salons",
    titleTag: city => `Salon Booking Software in ${city} | FlatPurse Flow`,
    meta: (city, province) => `Online booking, Tap to Pay and AI that recovers no-shows and fills empty chairs. Built in Edmonton for ${province} salons. From CAD ${PRICES.starter}/month.`,
    h1: city => `Salon booking and payments software for ${city} salons`,
    intro: city => `FlatPurse Flow is salon software built in Edmonton for salons in ${city} and across Canada. It runs bookings, payments, clients and staff in one app. Its AI Front Desk answers clients, and AutoPilot recovers no-shows and fills last-minute gaps so your chairs stay booked.`,
    uses: [
      { t: "Online booking, 24/7.", b: "Clients pick a service, stylist and time from your booking page and can pay online." },
      { t: "No-Show Recovery.", b: "About an hour after a missed appointment, Flow messages the client with an easy rebook link." },
      { t: "Last-Minute Slot Filler.", b: "A cancelled slot is offered to clients who want an earlier time." },
      { t: "AI Front Desk.", b: "Answers booking questions and books appointments while you're with a client." },
      { t: "Payments in the chair.", b: "Credit and Interac with Tap to Pay on your iPhone, tips included. No terminal to buy." },
      { t: "Daily Brief.", b: "A morning summary of today's bookings, yesterday's revenue and what needs your attention." },
    ],
    faqs: c => [canadaFaq(c), switchFaq, priceFaq],
  },
  {
    key: "barbershop", slugPrefix: "barbershop-software", noun: "barbershop", plural: "barbershops", staff: "barber", label: "Barbershops",
    titleTag: city => `Barbershop Booking App in ${city} | FlatPurse Flow`,
    meta: city => `Bookings, Tap to Pay and AI that rebooks no-shows, in one app for ${city} barbers. Built in Edmonton. No fees on new clients.`,
    h1: city => `Barbershop booking app and payments for ${city} barbers`,
    intro: city => `FlatPurse Flow is a barbershop app built in Edmonton for barbers in ${city} and across Canada. It handles bookings, takes payment on your phone and tracks every barber's chair. AutoPilot rebooks no-shows and reminds regulars when they're due for a cut.`,
    uses: [
      { t: "Online booking by barber.", b: "Clients pick their barber and see that barber's real availability." },
      { t: "Rebooking reminders.", b: "Flow learns each client's usual gap between cuts and nudges them when they're due." },
      { t: "No-Show Recovery.", b: "Missed appointments get a rebook message about an hour later, and the open slot goes to clients who want it." },
      { t: "AI Front Desk.", b: "Answers \"are you open?\" and \"can I get in today?\" and books the cut." },
      { t: "Tap to Pay.", b: "Credit and Interac on your iPhone, tips included. No card reader." },
      { t: "Clients.", b: "Every client's history, lifetime value and spend, with Overdue and Churn Risk flags on Pro and up." },
    ],
    faqs: c => [
      { q: "Does Flow work for a one- or two-chair shop?", a: `Yes. Starter covers up to 2 team members for CAD ${PRICES.starter}/month.` },
      readerFaq,
      { q: "Can I switch from Booksy?", a: "Yes. We import your clients, and you're set up in under a day." },
      canadaFaq(c),
    ],
  },
  {
    key: "spa", slugPrefix: "spa-software", noun: "spa", plural: "spas", staff: "therapist", label: "Spas",
    titleTag: city => `Spa Booking & Management Software in ${city} | FlatPurse Flow`,
    meta: (city, province) => `Treatment booking, payments and AI that fills cancelled treatments and brings clients back. Built in Edmonton for ${province} spas.`,
    h1: city => `Spa booking and management software for ${city} spas`,
    intro: city => `FlatPurse Flow is spa software built in Edmonton for spas in ${city} and across Canada. It runs treatment bookings, payments, clients and staff in one place. Its AI fills cancelled treatment slots and brings lapsed clients back.`,
    uses: [
      { t: "Treatment booking.", b: "Clients choose the treatment, therapist and time; each treatment carries its own length and price." },
      { t: "Payment links for deposits.", b: `Text a client a payment link to secure a long treatment. ${NO_TAX_ON_DEPOSIT}` },
      { t: "Last-Minute Slot Filler.", b: "A cancelled facial or massage is offered to clients on your list before the hour is lost." },
      { t: "Birthday offers.", b: "AutoPilot sends clients an offer around their birthday." },
      { t: "Client segments.", b: "On Pro and up, see who is New, Loyal, VIP, Overdue or at risk of leaving." },
      { t: "Reviews and reminders.", b: "Automatic reminders before every visit, and a review request after it." },
    ],
    faqs: c => [
      { q: "Does Flow send reminders?", a: "Yes, automatic reminders before every appointment." },
      { q: "Is client data stored in Canada?", a: "Yes. Client records are stored in Canada." },
      { q: `How does Flow handle ${c.province} sales tax?`, a: `It applies ${c.taxShort} on the final bill, and lets you mark any service tax-exempt.` },
      priceFaq,
    ],
  },
  {
    key: "massage-clinic", slugPrefix: "massage-clinic-software", noun: "massage clinic", plural: "massage clinics", staff: "therapist", label: "Massage clinics",
    titleTag: city => `Massage Clinic Booking Software in ${city} | FlatPurse Flow`,
    meta: city => `Online booking by therapist and treatment length, Tap to Pay and automatic rebooking for ${city} massage clinics. Built in Alberta, priced in CAD.`,
    h1: city => `Booking and payments software for ${city} massage clinics`,
    intro: city => `FlatPurse Flow is booking and payments software for massage clinics, built in Edmonton for clinics in ${city} and across Canada. Clients book online by therapist and treatment length, and AutoPilot reminds them when their next treatment is due.`,
    uses: [
      { t: "Online booking by therapist and length.", b: "Set 30, 60 or 90-minute treatments, each with its own price, and show each therapist's real availability." },
      { t: "Rebooking reminders.", b: "Clients on a treatment plan are reminded when it's time for their next session." },
      { t: "No-Show Recovery.", b: "Missed sessions trigger a rebook message about an hour later." },
      { t: "Taxable or exempt, per service.", b: "Mark each service taxable or exempt, so receipts follow your province's rules." },
      { t: "Tap to Pay.", b: "Take credit and Interac on an iPhone at the front desk. No terminal to buy." },
      { t: "Client history.", b: "Every client's visits, spend and notes in one place." },
    ],
    faqs: c => [
      { q: "Is massage therapy taxable?", a: `It depends on your province and whether massage therapy is a regulated health profession there. In ${c.province}, services generally carry ${c.taxShort}. Flow lets you mark each service taxable or exempt. Confirm your own status with your accountant.` },
      { q: "How fast can I switch?", a: "Under a day, and we import your clients for you." },
      readerFaq,
    ],
  },
  {
    key: "tattoo-studio", slugPrefix: "tattoo-studio-software", noun: "tattoo or nail studio", plural: "tattoo and nail studios", staff: "artist", label: "Tattoo & nail studios",
    titleTag: city => `Tattoo & Nail Studio Booking Software in ${city} | FlatPurse Flow`,
    meta: city => `Deposits by payment link, consults and long sessions on one calendar, and Tap to Pay, with AI that fills cancelled sessions. For ${city} studios.`,
    h1: city => `Booking and deposit software for ${city} tattoo and nail studios`,
    intro: city => `FlatPurse Flow handles bookings, deposits and payments for tattoo and nail studios in ${city} and across Canada, built in Edmonton. Deposits cut no-shows, and AutoPilot fills a cancelled session before the artist's day is lost.`,
    uses: [
      { t: "Deposits by payment link.", b: `Text a payment link to lock in a session. ${NO_TAX_ON_DEPOSIT}` },
      { t: "Consults and long sessions.", b: "Book a 15-minute consult or a 6-hour session on the same calendar." },
      { t: "Clients choose their artist.", b: "Your booking page shows each artist's real availability." },
      { t: "Last-Minute Slot Filler.", b: "A cancelled session is offered to clients waiting for an opening." },
      { t: "Tap to Pay.", b: "Take the balance with credit or Interac on an iPhone, tips included." },
      { t: "No-Show Recovery.", b: "A rebook message goes out about an hour after a missed appointment." },
    ],
    faqs: c => [
      { q: "Are deposits refundable?", a: "You set your own deposit and cancellation policy." },
      readerFaq,
      { q: `What tax do ${c.name} studios charge?`, a: `${c.province}: ${c.taxShort}, applied on the final bill. Deposits aren't taxed.` },
    ],
  },
];

export type LocalPage = { slug: string; vertical: Vertical; city: City };

export const LOCAL_PAGES: LocalPage[] = VERTICALS.flatMap(vertical =>
  CITIES.map(city => ({ slug: `${vertical.slugPrefix}-${city.key}`, vertical, city })),
);

export function getLocalPage(slug: string): LocalPage | undefined {
  return LOCAL_PAGES.find(p => p.slug === slug);
}
