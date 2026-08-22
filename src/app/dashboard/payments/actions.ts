"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentShopId } from "@/lib/dashboard/shop";
import type { AppointmentRow } from "../appointments/actions";

export type PaymentRow = {
  id: string;
  clientName: string;
  serviceName: string;
  startsAt: string;
  completedAt: string | null;
  status: AppointmentRow["status"];
  price: number;
  depositAmount: number | null;
  tipAmount: number | null;
  paidAmount: number | null;
  paymentMethod: string | null;
};

// Transaction history sourced from appointments — the only place payment
// data is actually recorded today (no separate transactions/ledger table).
// A payment exists here once completeAppointment has been called on a
// booking (src/app/dashboard/appointments/actions.ts), which sets
// paid_amount/payment_method, or the booking has a deposit on file.
export async function listPayments(rangeStart: string, rangeEnd: string): Promise<PaymentRow[]> {
  const shopId = await getCurrentShopId();
  if (!shopId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("id, client_name, service_name, starts_at, completed_at, status, price, deposit_amount, tip_amount, paid_amount, payment_method")
    .eq("shop_id", shopId)
    .or("paid_amount.not.is.null,deposit_amount.not.is.null")
    .gte("starts_at", rangeStart)
    .lte("starts_at", rangeEnd)
    .order("starts_at", { ascending: false });

  if (error) return [];

  return (data ?? []).map(r => ({
    id: r.id as string,
    clientName: r.client_name as string,
    serviceName: r.service_name as string,
    startsAt: r.starts_at as string,
    completedAt: (r.completed_at as string | null) ?? null,
    status: r.status as AppointmentRow["status"],
    price: Number(r.price),
    depositAmount: r.deposit_amount !== null ? Number(r.deposit_amount) : null,
    tipAmount: r.tip_amount !== null ? Number(r.tip_amount) : null,
    paidAmount: r.paid_amount !== null ? Number(r.paid_amount) : null,
    paymentMethod: (r.payment_method as string | null) ?? null,
  }));
}
