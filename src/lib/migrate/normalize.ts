// Turns a raw CSV from any booking platform into Flow's shape: works out
// what the file is (clients / services / team / appointments), matches its
// columns by alias, and normalizes names, money, durations and dates.
// Pure, runs in the browser; the server re-validates everything it receives.

export type ImportKind = "clients" | "services" | "staff" | "appointments";

export const KIND_LABELS: Record<ImportKind, string> = {
  clients: "Clients",
  services: "Services",
  staff: "Team",
  appointments: "Appointments",
};

export type FieldDef = { key: string; label: string; aliases: string[] };

const NAME = ["fullname", "name", "displayname"];
const FIRST = ["firstname", "givenname", "first", "clientfirstname", "customerfirstname"];
const LAST = ["lastname", "familyname", "surname", "last", "clientlastname", "customerlastname"];
const EMAIL = ["email", "emailaddress", "clientemail", "customeremail", "mail"];
const PHONE = ["mobile", "mobilenumber", "mobilephone", "cellphone", "cell", "phone", "phonenumber", "clientphone", "customerphone", "telephone", "primaryphone", "dayphone", "homephone"];

export const FIELDS: Record<ImportKind, FieldDef[]> = {
  clients: [
    { key: "fullName", label: "Full name", aliases: ["clientname", "customername", "client", "customer", ...NAME] },
    { key: "firstName", label: "First name", aliases: FIRST },
    { key: "lastName", label: "Last name", aliases: LAST },
    { key: "email", label: "Email", aliases: EMAIL },
    { key: "phone", label: "Phone", aliases: PHONE },
    { key: "birthday", label: "Birthday", aliases: ["birthday", "dateofbirth", "dob", "birthdate"] },
    { key: "notes", label: "Notes", aliases: ["notes", "note", "clientnotes", "comments", "memo", "alerts"] },
    { key: "visits", label: "Total visits", aliases: ["totalvisits", "visits", "visitcount", "numberofvisits", "totalappointments", "appointments", "transactioncount"] },
    { key: "totalSpent", label: "Total spent", aliases: ["totalsales", "totalspent", "lifetimevalue", "ltv", "totalspend", "salestotal", "totalrevenue", "lifetimespend"] },
    { key: "lastVisit", label: "Last visit", aliases: ["lastvisit", "lastvisitdate", "lastappointment", "lastappointmentdate", "lastbooking", "lastvisited"] },
  ],
  services: [
    { key: "name", label: "Service name", aliases: ["servicename", "itemname", "service", "treatment", "servicetitle", "name", "title"] },
    { key: "variation", label: "Variation", aliases: ["variationname", "variation", "option"] },
    { key: "price", label: "Price", aliases: ["price", "retailprice", "serviceprice", "defaultprice", "fullprice", "amount", "cost"] },
    { key: "duration", label: "Duration", aliases: ["duration", "durationminutes", "durationmins", "serviceduration", "length", "minutes", "mins", "time"] },
    { key: "category", label: "Category", aliases: ["category", "categoryname", "servicecategory", "servicegroup", "group", "menu", "type"] },
  ],
  staff: [
    { key: "fullName", label: "Name", aliases: ["staffname", "teammember", "employeename", "employee", "staff", "providername", ...NAME] },
    { key: "firstName", label: "First name", aliases: FIRST },
    { key: "lastName", label: "Last name", aliases: LAST },
    { key: "email", label: "Email", aliases: EMAIL },
    { key: "role", label: "Role", aliases: ["role", "jobtitle", "position", "title", "level"] },
  ],
  appointments: [
    { key: "clientName", label: "Client name", aliases: ["clientname", "customername", "client", "customer", "guest", ...NAME] },
    { key: "clientFirst", label: "Client first name", aliases: FIRST },
    { key: "clientLast", label: "Client last name", aliases: LAST },
    { key: "clientEmail", label: "Client email", aliases: EMAIL },
    { key: "clientPhone", label: "Client phone", aliases: PHONE },
    { key: "service", label: "Service", aliases: ["servicename", "service", "services", "treatment", "appointmenttype", "item", "servicetitle"] },
    { key: "staff", label: "Staff", aliases: ["staffname", "staff", "teammember", "staffmember", "employee", "provider", "stylist", "practitioner", "resource", "with"] },
    { key: "datetime", label: "Start date & time", aliases: ["startdatetime", "appointmentdatetime", "datetime", "startsat", "startat", "start"] },
    { key: "date", label: "Date", aliases: ["date", "appointmentdate", "scheduleddate", "startdate", "servicedate", "bookingdate", "day"] },
    { key: "time", label: "Time", aliases: ["time", "starttime", "appointmenttime", "scheduledtime"] },
    { key: "duration", label: "Duration", aliases: ["duration", "durationminutes", "durationmins", "length", "minutes", "mins"] },
    { key: "price", label: "Price", aliases: ["price", "serviceprice", "totalprice", "total", "amount", "sales", "revenue", "gross"] },
    { key: "status", label: "Status", aliases: ["status", "appointmentstatus", "bookingstatus", "state"] },
    { key: "notes", label: "Notes", aliases: ["notes", "appointmentnotes", "comments", "note"] },
  ],
};

const norm = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, "");

/** field key -> column index (or -1). Exact alias matches first, then "header contains alias". */
export type ColumnMap = Record<string, number>;

export function autoMap(kind: ImportKind, headers: string[]): ColumnMap {
  const normed = headers.map(norm);
  const used = new Set<number>();
  const map: ColumnMap = {};
  const fields = FIELDS[kind];

  for (const f of fields) map[f.key] = -1;
  for (const pass of ["exact", "contains"] as const) {
    for (const f of fields) {
      if (map[f.key] !== -1) continue;
      for (const alias of f.aliases) {
        const idx = normed.findIndex((h, i) => !used.has(i) && (pass === "exact" ? h === alias : alias.length >= 5 && h.includes(alias)));
        if (idx !== -1) { map[f.key] = idx; used.add(idx); break; }
      }
    }
  }
  return map;
}

export function detectKind(headers: string[], fileName: string): ImportKind {
  const f = fileName.toLowerCase();
  if (/appoint|booking|schedule/.test(f)) return "appointments";
  if (/service|item|catalog|menu|pricing/.test(f)) return "services";
  if (/staff|team|employee/.test(f)) return "staff";
  if (/client|customer|contact/.test(f)) return "clients";

  const n = new Set(headers.map(norm));
  const any = (xs: string[]) => xs.some(x => n.has(x));
  const appt = autoMap("appointments", headers);
  const hasDate = appt.datetime !== -1 || appt.date !== -1;
  if (hasDate && (appt.service !== -1 || appt.staff !== -1)) return "appointments";
  if (any(["price", "retailprice", "duration", "variationname"]) && !any(EMAIL) && !any(PHONE)) return "services";
  if (any(["role", "jobtitle", "position", "teammember", "employee"])) return "staff";
  return "clients";
}

// ─── value parsing ──────────────────────────────────────────────────────────

const clean = (s: string | undefined) => (s ?? "").trim();

export function parseMoney(raw: string | undefined): number | null {
  const s = clean(raw).replace(/[^0-9.,-]/g, "");
  if (!s) return null;
  // "1.234,50" (European) vs "1,234.50"
  const n = /,\d{2}$/.test(s) && !/\.\d{2}$/.test(s) ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  const v = parseFloat(n);
  return isFinite(v) ? Math.round(v * 100) / 100 : null;
}

export function parseDuration(raw: string | undefined): number | null {
  const s = clean(raw).toLowerCase();
  if (!s) return null;
  const hm = s.match(/^(\d{1,2}):(\d{2})/);
  if (hm) return parseInt(hm[1], 10) * 60 + parseInt(hm[2], 10);
  const h = s.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/);
  const m = s.match(/(\d+)\s*(?:m|min|mins|minute|minutes)\b/);
  let total = 0;
  if (h) total += parseFloat(h[1]) * 60;
  if (m) total += parseInt(m[1], 10);
  if (!h && !m) total = parseFloat(s) || 0;
  return total > 0 && total <= 24 * 60 ? Math.round(total) : null;
}

function parseTime(raw: string): { h: number; m: number } | null {
  const t = raw.trim().match(/(\d{1,2})(?:[:.](\d{2}))?(?::\d{2})?\s*(am|pm|a\.m\.|p\.m\.)?/i);
  if (!t) return null;
  let h = parseInt(t[1], 10);
  const m = t[2] ? parseInt(t[2], 10) : 0;
  const ap = t[3]?.toLowerCase().replace(/\./g, "");
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return h < 24 && m < 60 ? { h, m } : null;
}

/** True when the file writes dates day-first (any first component > 12). */
export function detectDayFirst(samples: string[]): boolean {
  for (const s of samples) {
    const m = clean(s).match(/^(\d{1,2})[/.-](\d{1,2})[/.-]\d{2,4}/);
    if (m && parseInt(m[1], 10) > 12) return true;
    if (m && parseInt(m[2], 10) > 12) return false;
  }
  return false; // North American default
}

/** Local date (and optional time) -> Date, or null when unparseable. */
export function parseDateTime(dateRaw: string | undefined, timeRaw: string | undefined, dayFirst: boolean): Date | null {
  const s = clean(dateRaw).replace(/\bat\b/i, " ");
  if (!s) return null;
  let y: number, mo: number, d: number, rest = "";

  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(.*)$/);
  const num = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})(.*)$/);
  if (iso) { y = +iso[1]; mo = +iso[2]; d = +iso[3]; rest = iso[4]; }
  else if (num) {
    const [a, b] = [+num[1], +num[2]];
    [d, mo] = dayFirst ? [a, b] : [b, a];
    y = +num[3] < 100 ? 2000 + +num[3] : +num[3];
    rest = num[4];
  } else {
    const parsed = new Date(s.replace(/,/g, " "));
    if (isNaN(parsed.getTime())) return null;
    y = parsed.getFullYear(); mo = parsed.getMonth() + 1; d = parsed.getDate();
    const hasTime = /\d:\d{2}|\d\s*(am|pm)/i.test(s);
    rest = hasTime ? `${parsed.getHours()}:${String(parsed.getMinutes()).padStart(2, "0")}` : "";
  }
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return null;

  const t = parseTime(clean(timeRaw) || rest.replace(/^[T\s,]+/, "")) ?? { h: 0, m: 0 };
  const out = new Date(y, mo - 1, d, t.h, t.m);
  return isNaN(out.getTime()) ? null : out;
}

function isoDate(d: Date | null): string | null {
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function joinName(full: string, first: string, last: string): string {
  return (full || [first, last].filter(Boolean).join(" ")).replace(/\s+/g, " ").trim();
}

function mapStatus(raw: string, startsAt: Date, now: Date): string {
  const s = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (s.includes("cancel") || s.includes("declined") || s.includes("rejected")) return "cancelled";
  if (s.includes("noshow") || s.includes("missed")) return "no_show";
  if (/complete|checkedout|paid|arrived|done|finished|attended|started/.test(s)) return "completed";
  // A past booking the old system never closed out still happened.
  return startsAt.getTime() < now.getTime() ? "completed" : "confirmed";
}

// ─── row normalizers ────────────────────────────────────────────────────────

export type NClient = { name: string; email: string | null; phone: string | null; birthday: string | null; notes: string | null; visits: number | null; totalSpent: number | null; lastVisit: string | null };
export type NService = { name: string; price: number; duration: number; category: string | null };
export type NStaff = { name: string; email: string | null; role: string | null };
export type NAppointment = { clientName: string; clientEmail: string | null; clientPhone: string | null; service: string; staff: string | null; startsAt: string; duration: number; price: number; status: string; notes: string | null };
export type NormalizedRow = NClient | NService | NStaff | NAppointment;

export function normalizeRows(kind: ImportKind, rows: string[][], map: ColumnMap): { ok: NormalizedRow[]; skipped: number } {
  const get = (r: string[], key: string) => (map[key] >= 0 ? clean(r[map[key]]) : "");
  const dateCol = kind === "appointments" ? (map.datetime >= 0 ? "datetime" : "date") : kind === "clients" ? "lastVisit" : "";
  const dayFirst = dateCol ? detectDayFirst(rows.slice(0, 200).map(r => get(r, dateCol))) : false;
  const now = new Date();
  const ok: NormalizedRow[] = [];
  let skipped = 0;

  for (const r of rows) {
    if (kind === "clients") {
      const name = joinName(get(r, "fullName"), get(r, "firstName"), get(r, "lastName"));
      const email = get(r, "email").toLowerCase() || null;
      const phone = get(r, "phone") || null;
      if (!name && !email && !phone) { skipped++; continue; }
      const lastVisit = parseDateTime(get(r, "lastVisit"), undefined, dayFirst);
      ok.push({
        name: name || email || phone!, email, phone,
        birthday: isoDate(parseDateTime(get(r, "birthday"), undefined, dayFirst)),
        notes: get(r, "notes") || null,
        visits: get(r, "visits") ? Math.max(0, Math.round(Number(get(r, "visits")) || 0)) : null,
        totalSpent: parseMoney(get(r, "totalSpent")),
        lastVisit: lastVisit ? lastVisit.toISOString() : null,
      });
    } else if (kind === "services") {
      const base = get(r, "name");
      const variation = get(r, "variation");
      const name = variation && !/^regular$/i.test(variation) && variation !== base ? `${base} (${variation})` : base;
      const price = parseMoney(get(r, "price"));
      if (!name || price === null) { skipped++; continue; }
      ok.push({ name, price, duration: parseDuration(get(r, "duration")) ?? 30, category: get(r, "category") || null });
    } else if (kind === "staff") {
      const name = joinName(get(r, "fullName"), get(r, "firstName"), get(r, "lastName"));
      if (!name) { skipped++; continue; }
      ok.push({ name, email: get(r, "email").toLowerCase() || null, role: get(r, "role") || null });
    } else {
      const startsAt = parseDateTime(get(r, dateCol), get(r, "time"), dayFirst);
      const clientName = joinName(get(r, "clientName"), get(r, "clientFirst"), get(r, "clientLast"));
      const clientEmail = get(r, "clientEmail").toLowerCase() || null;
      if (!startsAt || (!clientName && !clientEmail)) { skipped++; continue; }
      ok.push({
        clientName: clientName || clientEmail!, clientEmail,
        clientPhone: get(r, "clientPhone") || null,
        service: get(r, "service") || "Appointment",
        staff: get(r, "staff") || null,
        startsAt: startsAt.toISOString(),
        duration: parseDuration(get(r, "duration")) ?? 60,
        price: parseMoney(get(r, "price")) ?? 0,
        status: mapStatus(get(r, "status"), startsAt, now),
        notes: get(r, "notes") || null,
      });
    }
  }
  return { ok, skipped };
}
