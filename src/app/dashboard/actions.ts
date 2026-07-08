"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getShopContext } from "@/lib/dashboard/shop";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type SearchResult =
  | { kind: "appointment"; id: string; title: string; subtitle: string }
  | { kind: "staff"; id: string; title: string; subtitle: string };

export async function searchDashboard(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const ctx = await getShopContext();
  if (!ctx) return [];

  const supabase = await createClient();

  const { data: appts } = await supabase
    .from("appointments")
    .select("id, client_name, service_name, starts_at")
    .eq("shop_id", ctx.shopId)
    .ilike("client_name", `%${q}%`)
    .order("starts_at", { ascending: false })
    .limit(5);

  const results: SearchResult[] = (appts ?? []).map(a => ({
    kind: "appointment" as const,
    id: a.id as string,
    title: a.client_name as string,
    subtitle: `${a.service_name} · ${new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" }).format(new Date(a.starts_at as string))}`,
  }));

  if (ctx.role === "owner") {
    const { data: staff } = await supabase
      .from("staff")
      .select("id, full_name, role")
      .eq("shop_id", ctx.shopId)
      .eq("active", true)
      .ilike("full_name", `%${q}%`)
      .limit(5);

    for (const s of staff ?? []) {
      results.push({ kind: "staff", id: s.id as string, title: s.full_name as string, subtitle: (s.role as string | null) ?? "Team member" });
    }
  }

  return results;
}
