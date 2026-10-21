import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/seo/facts";
import { ReferralsClient, type ReferralRow, type ClientReferralRow } from "./ReferralsClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ReferralsPage() {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") redirect("/dashboard");

  // Admin client: the referred shops belong to other owners, so RLS hides
  // their names; only the name and status are shown.
  const admin = createAdminClient();
  const [{ data: shop }, { data: refs }, { data: clientRefs }] = await Promise.all([
    admin.from("shops").select("referral_code, client_referrals_enabled, client_referral_reward").eq("id", ctx.shopId).single(),
    admin
      .from("referrals")
      .select("id, status, referrer_credit, referrer_credit_cents, created_at, referred:shops!referrals_referred_shop_id_fkey(name)")
      .eq("referrer_shop_id", ctx.shopId)
      .order("created_at", { ascending: false }),
    admin
      .from("client_referrals")
      .select("id, reward, created_at, referrer_reward_appointment_id, referrer:customers!client_referrals_referrer_customer_id_fkey(full_name), referred:customers!client_referrals_referred_customer_id_fkey(full_name)")
      .eq("shop_id", ctx.shopId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const clientRows: ClientReferralRow[] = (clientRefs ?? []).map(r => ({
    id: r.id as string,
    referrer: ((r.referrer as unknown as { full_name: string } | null)?.full_name) ?? "A client",
    referred: ((r.referred as unknown as { full_name: string } | null)?.full_name) ?? "A client",
    reward: Number(r.reward),
    rewardUsed: Boolean(r.referrer_reward_appointment_id),
    createdAt: r.created_at as string,
  }));

  const rows: ReferralRow[] = (refs ?? []).map(r => ({
    id: r.id as string,
    name: ((r.referred as unknown as { name: string } | null)?.name) ?? "A salon",
    status: r.status as ReferralRow["status"],
    credit: r.referrer_credit as ReferralRow["credit"],
    creditCents: (r.referrer_credit_cents as number | null) ?? 0,
    createdAt: r.created_at as string,
  }));

  return (
    <ReferralsClient
      link={`${SITE_URL}/r/${shop?.referral_code ?? ""}`}
      rows={rows}
      clientReferrals={{ enabled: Boolean(shop?.client_referrals_enabled), reward: Number(shop?.client_referral_reward ?? 10), rows: clientRows }}
    />
  );
}
