// Canadian sales tax engine for all 13 provinces and territories.
//
// Rules this encodes (rates as of 2026, per TaxTips.ca and the CRA):
// - GST is 5% everywhere. Ontario and the Atlantic provinces fold it into a
//   single HST rate instead.
// - BC, Saskatchewan and Manitoba add a separate provincial tax (PST/RST) that
//   always applies to retail goods but only to some services. Manitoba's RST
//   no longer applies to hair, skin, spa or massage services (Bulletin 062);
//   BC's PST doesn't cover personal services. Saskatchewan depends on the
//   service, so the owner decides with `pstOnServices`.
// - Quebec's QST applies to services and goods and is calculated on the
//   pre-tax price, not on price + GST.
// - Deposits aren't taxed. Tax is charged on the final bill for the full
//   service price, and the deposit is then deducted from what's owed.
// - Tips are never taxed.
// - A small supplier (under C$30,000 of taxable revenue in four consecutive
//   quarters) can choose not to register; unregistered shops charge no tax.

export type ProvinceCode =
  | "AB" | "BC" | "MB" | "NB" | "NL" | "NS" | "NT" | "NU" | "ON" | "PE" | "QC" | "SK" | "YT";

export type TaxComponent = {
  /** Label printed on receipts, e.g. "GST", "HST", "PST", "QST". */
  label: string;
  /** Percent, e.g. 5 for 5%. */
  rate: number;
  kind: "federal" | "harmonized" | "provincial";
  /** Whether this component applies to services by default (always applies to retail). */
  servicesByDefault: boolean;
};

export type Province = {
  code: ProvinceCode;
  name: string;
  components: TaxComponent[];
  /** True when the provincial component on services is the owner's call (shown as a toggle in Settings). */
  pstOnServicesConfigurable: boolean;
  /** Short plain-English note shown in Settings. */
  note: string;
};

const GST: TaxComponent = { label: "GST", rate: 5, kind: "federal", servicesByDefault: true };
const hst = (rate: number): TaxComponent => ({ label: "HST", rate, kind: "harmonized", servicesByDefault: true });

export const PROVINCES: Province[] = [
  { code: "AB", name: "Alberta", components: [GST], pstOnServicesConfigurable: false, note: "5% GST, no provincial sales tax." },
  { code: "BC", name: "British Columbia", components: [GST, { label: "PST", rate: 7, kind: "provincial", servicesByDefault: false }], pstOnServicesConfigurable: true, note: "5% GST. 7% PST applies to retail products; most personal services aren't subject to PST." },
  { code: "MB", name: "Manitoba", components: [GST, { label: "RST", rate: 7, kind: "provincial", servicesByDefault: false }], pstOnServicesConfigurable: true, note: "5% GST. 7% RST applies to retail products; it no longer applies to hair, skin, spa or massage services. Tanning is still taxable." },
  { code: "NB", name: "New Brunswick", components: [hst(15)], pstOnServicesConfigurable: false, note: "15% HST." },
  { code: "NL", name: "Newfoundland and Labrador", components: [hst(15)], pstOnServicesConfigurable: false, note: "15% HST." },
  { code: "NS", name: "Nova Scotia", components: [hst(14)], pstOnServicesConfigurable: false, note: "14% HST." },
  { code: "NT", name: "Northwest Territories", components: [GST], pstOnServicesConfigurable: false, note: "5% GST, no territorial sales tax." },
  { code: "NU", name: "Nunavut", components: [GST], pstOnServicesConfigurable: false, note: "5% GST, no territorial sales tax." },
  { code: "ON", name: "Ontario", components: [hst(13)], pstOnServicesConfigurable: false, note: "13% HST." },
  { code: "PE", name: "Prince Edward Island", components: [hst(15)], pstOnServicesConfigurable: false, note: "15% HST." },
  { code: "QC", name: "Quebec", components: [GST, { label: "QST", rate: 9.975, kind: "provincial", servicesByDefault: true }], pstOnServicesConfigurable: false, note: "5% GST plus 9.975% QST, each calculated on the pre-tax price." },
  { code: "SK", name: "Saskatchewan", components: [GST, { label: "PST", rate: 6, kind: "provincial", servicesByDefault: false }], pstOnServicesConfigurable: true, note: "5% GST. 6% PST applies to retail products; whether it applies to your services depends on the service. Check Saskatchewan's PST bulletins." },
  { code: "YT", name: "Yukon", components: [GST], pstOnServicesConfigurable: false, note: "5% GST, no territorial sales tax." },
];

const BY_CODE = new Map(PROVINCES.map(p => [p.code, p]));

export function getProvince(code: string | null | undefined): Province | null {
  if (!code) return null;
  return BY_CODE.get(code.toUpperCase() as ProvinceCode) ?? null;
}

const ALIASES: Record<string, ProvinceCode> = {
  "PEI": "PE", "P.E.I.": "PE", "NEWFOUNDLAND": "NL", "LABRADOR": "NL", "NWT": "NT", "YUKON TERRITORY": "YT",
  "QUÉBEC": "QC", "B.C.": "BC",
};

/** Best-effort match of free-text province input ("Alberta", "ab", "Ontario ") to a code. */
export function normalizeProvince(input: string | null | undefined): ProvinceCode | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (BY_CODE.has(upper as ProvinceCode)) return upper as ProvinceCode;
  if (ALIASES[upper]) return ALIASES[upper];
  const byName = PROVINCES.find(p => p.name.toUpperCase() === upper);
  return byName?.code ?? null;
}

export type ShopTaxSettings = {
  provinceCode: string | null;
  /** False for a small supplier that hasn't registered for GST/HST: no tax is charged. */
  registered: boolean;
  /** Owner's choice for BC/MB/SK: charge the provincial tax on services too. */
  pstOnServices: boolean;
  /** Prices already include tax; tax is backed out rather than added. */
  inclusive: boolean;
};

export type TaxLineInput = {
  amount: number;
  kind: "service" | "retail";
  /** A service the owner marked exempt (e.g. massage by a regulated therapist). */
  exempt?: boolean;
};

export type TaxBreakdown = {
  /** Pre-tax amount (backed out of the price when prices are tax-inclusive). */
  subtotal: number;
  lines: { label: string; rate: number; amount: number }[];
  tax: number;
  /** subtotal + tax. Equals the sum of the input amounts when prices are tax-inclusive. */
  total: number;
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

function componentApplies(c: TaxComponent, kind: TaxLineInput["kind"], settings: ShopTaxSettings): boolean {
  if (kind === "retail") return true;
  if (c.kind === "provincial") return c.servicesByDefault || settings.pstOnServices;
  return true;
}

/** Combined percent that applies to a line of the given kind. */
export function effectiveRate(settings: ShopTaxSettings, kind: TaxLineInput["kind"] = "service"): number {
  const province = getProvince(settings.provinceCode);
  if (!province || !settings.registered) return 0;
  return province.components.filter(c => componentApplies(c, kind, settings)).reduce((s, c) => s + c.rate, 0);
}

export function computeTax(settings: ShopTaxSettings, inputs: TaxLineInput[]): TaxBreakdown {
  const province = getProvince(settings.provinceCode);
  const gross = round2(inputs.reduce((s, l) => s + l.amount, 0));
  if (!province || !settings.registered) {
    return { subtotal: gross, lines: [], tax: 0, total: gross };
  }

  const totals = new Map<string, { label: string; rate: number; amount: number }>();
  let subtotal = 0;

  for (const line of inputs) {
    const applicable = line.exempt ? [] : province.components.filter(c => componentApplies(c, line.kind, settings));
    const combined = applicable.reduce((s, c) => s + c.rate, 0) / 100;
    // Every component is a percentage of the same pre-tax base (QST included).
    const base = settings.inclusive ? line.amount / (1 + combined) : line.amount;
    subtotal += base;
    for (const c of applicable) {
      const entry = totals.get(c.label) ?? { label: c.label, rate: c.rate, amount: 0 };
      entry.amount += base * c.rate / 100;
      totals.set(c.label, entry);
    }
  }

  const lines = province.components
    .map(c => totals.get(c.label))
    .filter((l): l is { label: string; rate: number; amount: number } => Boolean(l))
    .map(l => ({ ...l, amount: round2(l.amount) }));
  const tax = round2(lines.reduce((s, l) => s + l.amount, 0));

  if (settings.inclusive) {
    // Keep the receipt adding up to the price the client was quoted.
    return { subtotal: round2(gross - tax), lines, tax, total: gross };
  }
  const sub = round2(subtotal);
  return { subtotal: sub, lines, tax, total: round2(sub + tax) };
}

/** e.g. "GST 5%" or "GST 5% + QST 9.975%" for labels. */
export function describeRates(settings: ShopTaxSettings, kind: TaxLineInput["kind"] = "service"): string {
  const province = getProvince(settings.provinceCode);
  if (!province) return "No province set";
  if (!settings.registered) return "Not registered: no tax charged";
  const applicable = province.components.filter(c => componentApplies(c, kind, settings));
  return applicable.map(c => `${c.label} ${c.rate}%`).join(" + ");
}

/** Shop columns -> settings. Shops saved before the tax engine fall back to their free-text province. */
export function shopTaxSettings(shop: {
  province_code?: string | null;
  province?: string | null;
  tax_registered?: boolean | null;
  pst_on_services?: boolean | null;
  tax_inclusive?: boolean | null;
}): ShopTaxSettings {
  return {
    provinceCode: shop.province_code ?? normalizeProvince(shop.province),
    registered: shop.tax_registered ?? true,
    pstOnServices: Boolean(shop.pst_on_services),
    inclusive: Boolean(shop.tax_inclusive),
  };
}
