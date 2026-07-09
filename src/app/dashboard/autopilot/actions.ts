"use server";

import { requireShop, getCurrentShopId } from "@/lib/dashboard/shop";

export type FlowKey = "noshow" | "filler" | "winback" | "frontdesk" | "reminders" | "birthday";

export async function getAutopilotEngagedClientNames(): Promise<string[]> {
  const shopId = await getCurrentShopId();
  if (!shopId) return [];

  const { supabase } = await requireShop();
  const { data } = await supabase
    .from("autopilot_events")
    .select("client_name")
    .eq("shop_id", shopId)
    .not("client_name", "is", null);

  const names = new Set<string>();
  for (const row of data ?? []) {
    if (row.client_name) names.add(String(row.client_name).trim().toLowerCase());
  }
  return Array.from(names);
}

export type AutopilotEvent = {
  id: string;
  flow_key: FlowKey;
  event_text: string;
  amount: number | null;
  client_name: string | null;
  created_at: string;
};

export type AutopilotState = {
  stripeConnected: boolean;
  events: AutopilotEvent[];
  flowStats: Record<FlowKey, { count: number; revenue: number }>;
  totals: { actions: number; customers: number; revenue: number };
};

const EMPTY_FLOW_STATS: Record<FlowKey, { count: number; revenue: number }> = {
  noshow: { count: 0, revenue: 0 },
  filler: { count: 0, revenue: 0 },
  winback: { count: 0, revenue: 0 },
  frontdesk: { count: 0, revenue: 0 },
  reminders: { count: 0, revenue: 0 },
  birthday: { count: 0, revenue: 0 },
};

export async function getAutopilotState(): Promise<AutopilotState> {
  const shopId = await getCurrentShopId();
  if (!shopId) {
    return { stripeConnected: false, events: [], flowStats: EMPTY_FLOW_STATS, totals: { actions: 0, customers: 0, revenue: 0 } };
  }

  const { supabase } = await requireShop();

  const { data: shop } = await supabase
    .from("shops")
    .select("stripe_connected")
    .eq("id", shopId)
    .maybeSingle();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { data: monthEvents } = await supabase
    .from("autopilot_events")
    .select("flow_key, amount, client_name")
    .eq("shop_id", shopId)
    .gte("created_at", monthStart.toISOString());

  const { data: recentEvents } = await supabase
    .from("autopilot_events")
    .select("id, flow_key, event_text, amount, client_name, created_at")
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false })
    .limit(20);

  const flowStats: Record<FlowKey, { count: number; revenue: number }> = {
    noshow: { count: 0, revenue: 0 },
    filler: { count: 0, revenue: 0 },
    winback: { count: 0, revenue: 0 },
    frontdesk: { count: 0, revenue: 0 },
    reminders: { count: 0, revenue: 0 },
    birthday: { count: 0, revenue: 0 },
  };

  const customers = new Set<string>();
  let revenue = 0;

  for (const e of monthEvents ?? []) {
    const key = e.flow_key as FlowKey;
    if (flowStats[key]) {
      flowStats[key].count += 1;
      flowStats[key].revenue += Number(e.amount ?? 0);
    }
    revenue += Number(e.amount ?? 0);
    if (e.client_name) customers.add(e.client_name);
  }

  return {
    stripeConnected: Boolean(shop?.stripe_connected),
    events: (recentEvents ?? []) as AutopilotEvent[],
    flowStats,
    totals: { actions: (monthEvents ?? []).length, customers: customers.size, revenue },
  };
}
