// Real, derived "AI opportunity" insights. Two are computed for real from
// appointments/clients; two (PRICING, FRONT DESK) have no real data source yet
// (no market-benchmark feed, no Twilio/messaging integration) and are surfaced
// as honest "not available yet" cards rather than fabricated numbers.

import type { ClientAppointment } from "./clients";
import { deriveClients } from "./clients";
import { findSlowestWeekday } from "./metrics";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type Opportunity = {
  tag: string;
  color: string;
  text: string;
  impact: string | null; // null = no real figure available
  available: boolean;
};

export function computeOpportunities(appointments: ClientAppointment[], now: Date): Opportunity[] {
  const clients = deriveClients(appointments, now);
  const overdue = clients.filter(c => c.tag === "Overdue" || c.tag === "Churn risk");

  const completedThisRange = appointments.filter(a => a.status === "completed");
  const avgTicket = completedThisRange.length > 0
    ? completedThisRange.reduce((s, a) => s + Number(a.price), 0) / completedThisRange.length
    : 0;

  const winback: Opportunity = overdue.length > 0
    ? {
        tag: "WIN-BACK", color: "rgb(167,139,250)",
        text: `${overdue.length} client${overdue.length === 1 ? "" : "s"} overdue for rebook: trigger 30-day flow`,
        impact: avgTicket > 0 ? `+${fmtPrice(overdue.length * avgTicket)}` : null,
        available: true,
      }
    : { tag: "WIN-BACK", color: "rgb(167,139,250)", text: "No overdue clients right now, nice work.", impact: null, available: true };

  const slowest = findSlowestWeekday(appointments, now);

  const slots: Opportunity = slowest
    ? {
        tag: "SLOTS", color: "rgb(52,211,153)",
        text: `${WEEKDAYS[slowest.weekdayIndex]}s are your lowest-booked day over the last 4 weeks: consider a flash deal`,
        impact: avgTicket > 0 ? `+${fmtPrice(avgTicket)}/wk potential` : null,
        available: true,
      }
    : { tag: "SLOTS", color: "rgb(52,211,153)", text: "Not enough booking history yet to spot a pattern.", impact: null, available: true };

  const cancelledThisRange = appointments.filter(a => a.status === "cancelled");
  const cancellationRate = appointments.length > 0 ? Math.round((cancelledThisRange.length / appointments.length) * 100) : 0;
  const missedRevenue = cancelledThisRange.reduce((s, a) => s + Number(a.price), 0);

  const cancellations: Opportunity = {
    tag: "CANCELLATIONS", color: "rgb(251,191,36)",
    text: cancelledThisRange.length > 0
      ? `${cancellationRate}% cancellation rate: ${fmtPrice(missedRevenue)} in lost bookings this window`
      : "No cancellations in this window.",
    impact: missedRevenue > 0 ? `-${fmtPrice(missedRevenue)}` : null,
    available: true,
  };

  const pricing: Opportunity = {
    tag: "PRICING", color: "rgb(96,165,250)",
    text: "Pricing benchmarks need a market-rate data source, not available yet.",
    impact: null, available: false,
  };

  const frontdesk: Opportunity = {
    tag: "FRONT DESK", color: "rgb(248,113,113)",
    text: "AI Front Desk needs a messaging integration (e.g. Twilio) connected, not available yet.",
    impact: null, available: false,
  };

  return [winback, slots, cancellations, pricing, frontdesk];
}

function fmtPrice(n: number) {
  return Number.isInteger(n) ? `C$${n}` : `C$${n.toFixed(2)}`;
}
