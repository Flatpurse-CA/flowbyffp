import { notFound, redirect } from "next/navigation";
import { getAuthUser, getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptAnswers } from "@/lib/intake/crypto";
import type { IntakeField } from "@/lib/intake/templates";

export const dynamic = "force-dynamic";

/** One intake response. Owner or the assigned staff member only; every open is logged. */
export default async function IntakeViewPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const ctx = await getShopContext();
  if (!ctx) redirect("/dashboard");
  const { id } = await searchParams;
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) notFound();
  const admin = createAdminClient();
  const { data: r } = await admin.from("intake_responses").select("id, client_name, answers_enc, created_at, appointments(staff_id)").eq("id", id).eq("shop_id", ctx.shopId).maybeSingle();
  if (!r) notFound();
  const staffId = (r.appointments as unknown as { staff_id: string | null } | null)?.staff_id ?? null;
  if (ctx.role !== "owner" && (!ctx.staffId || ctx.staffId !== staffId)) notFound();
  const user = await getAuthUser();
  await admin.from("intake_views").insert({ response_id: r.id, viewer_id: user?.id ?? null, viewer_role: ctx.role });
  const { fields, answers } = decryptAnswers<{ fields: IntakeField[]; answers: Record<string, string> }>(r.answers_enc as string);
  const { data: views } = await admin.from("intake_views").select("viewer_role, viewed_at").eq("response_id", r.id).order("viewed_at", { ascending: false }).limit(20);
  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
      <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: 0 }}>{r.client_name as string}</h1>
      {fields.map((f) => (
        <div key={f.id} style={{ background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 12, padding: 12 }}>
          <p style={{ color: "var(--dw45)", fontSize: 12.5, margin: "0 0 4px" }}>{f.label}</p>
          <p style={{ color: "var(--dtext)", fontSize: 14.5, margin: 0, whiteSpace: "pre-wrap" }}>{answers[f.id] || "-"}</p>
        </div>
      ))}
      <p style={{ color: "var(--dw45)", fontSize: 12, margin: 0 }}>View log: {(views ?? []).map((v) => `${v.viewer_role} ${new Date(v.viewed_at as string).toLocaleString("en-CA", { timeZone: "America/Edmonton" })}`).join(" · ")}</p>
    </div>
  );
}
