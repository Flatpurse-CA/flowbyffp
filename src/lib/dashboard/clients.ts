// Pure client-aggregation helpers — derives a CRM-like client list straight from
// appointments (no dedicated clients table exists yet). No Supabase import.

export type ClientAppointment = {
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  customer_id?: string | null;
  starts_at: string;
  price: number;
  status: "confirmed" | "pending" | "deposit" | "completed" | "cancelled";
};

export type ClientTag = "New" | "Loyal" | "VIP" | "Overdue" | "Churn risk" | null;

export type DerivedClient = {
  key: string;
  name: string;
  phone: string | null;
  email: string | null;
  visits: number;
  ltv: number;
  lastVisitAt: string | null;
  avgIntervalDays: number | null;
  daysSinceLastVisit: number | null;
  tag: ClientTag;
};

// customer_id (a real, stable account) takes priority over the free-text
// contact fields — it's the only identity that's guaranteed not to drift
// between visits (a client's phone/email captured at booking time can vary
// or be left blank, but their account id never changes). Falls back to
// phone/email/name only for walk-ins with no linked account.
export function keyFor(a: ClientAppointment) {
  return (a.customer_id || a.client_phone || a.client_email || a.client_name).trim().toLowerCase();
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function deriveClients(appointments: ClientAppointment[], now: Date): DerivedClient[] {
  const groups = new Map<string, ClientAppointment[]>();
  for (const a of appointments) {
    if (a.status === "cancelled") continue;
    const key = keyFor(a);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(a);
  }

  const clients: DerivedClient[] = [];

  for (const [key, appts] of groups) {
    const sorted = [...appts].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
    const completed = sorted.filter(a => a.status === "completed");
    const visits = completed.length;
    const ltv = completed.reduce((s, a) => s + Number(a.price), 0);
    const lastVisitAt = completed.length > 0 ? completed[completed.length - 1].starts_at : null;

    let avgIntervalDays: number | null = null;
    if (completed.length >= 2) {
      const gaps: number[] = [];
      for (let i = 1; i < completed.length; i++) {
        const gap = (new Date(completed[i].starts_at).getTime() - new Date(completed[i - 1].starts_at).getTime()) / MS_PER_DAY;
        gaps.push(gap);
      }
      avgIntervalDays = gaps.reduce((s, g) => s + g, 0) / gaps.length;
    }

    const daysSinceLastVisit = lastVisitAt ? (now.getTime() - new Date(lastVisitAt).getTime()) / MS_PER_DAY : null;

    let tag: ClientTag = null;
    if (visits === 0) {
      tag = "New"; // has an upcoming/pending booking but no completed visit yet
    } else if (visits === 1) {
      tag = "New";
    } else if (avgIntervalDays && daysSinceLastVisit !== null && daysSinceLastVisit > avgIntervalDays * 2.5) {
      tag = "Churn risk";
    } else if (avgIntervalDays && daysSinceLastVisit !== null && daysSinceLastVisit > avgIntervalDays * 1.5) {
      tag = "Overdue";
    } else if (visits >= 5 && ltv >= 500) {
      tag = "VIP";
    } else if (visits >= 3) {
      tag = "Loyal";
    }

    const latest = sorted[sorted.length - 1];
    clients.push({
      key,
      name: latest.client_name,
      phone: latest.client_phone,
      email: latest.client_email,
      visits,
      ltv,
      lastVisitAt,
      avgIntervalDays,
      daysSinceLastVisit,
      tag,
    });
  }

  return clients.sort((a, b) => b.ltv - a.ltv);
}

export function computeRebookingRate(clients: DerivedClient[]): number {
  const withVisits = clients.filter(c => c.visits >= 1);
  if (withVisits.length === 0) return 0;
  const rebooked = withVisits.filter(c => c.visits >= 2).length;
  return Math.round((rebooked / withVisits.length) * 100);
}
