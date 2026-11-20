import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Receipt", robots: { index: false, follow: false } };

const money = (n: number) => `$${n.toFixed(2)}`;
const row: React.CSSProperties = { display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14.5 };

/** CRA-compliant, insurance-ready receipt (FL-035/044). Tips shown separately and untaxed. */
export default async function ReceiptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-f0-9]{24}$/.test(token)) notFound();
  const admin = createAdminClient();
  const { data: a } = await admin.from("appointments")
    .select("id, shop_id, staff_id, client_name, service_name, starts_at, completed_at, price, tip_amount, paid_amount, payment_method, tax_amount, tax_breakdown, refunded_amount")
    .eq("manage_token", token).maybeSingle();
  if (!a || a.paid_amount == null) notFound();
  const [{ data: shop }, { data: staff }] = await Promise.all([
    admin.from("shops").select("name, street_address, city, province, phone, tax_number").eq("id", a.shop_id).maybeSingle(),
    a.staff_id ? admin.from("staff").select("full_name, registration_number, registration_body").eq("id", a.staff_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const tip = Number(a.tip_amount ?? 0);
  const tax = Number(a.tax_amount ?? 0);
  const lines = (a.tax_breakdown as { lines?: { label: string; amount: number }[] } | null)?.lines ?? [];
  const date = new Date((a.completed_at as string | null) ?? (a.starts_at as string)).toLocaleDateString("en-CA", { timeZone: "America/Edmonton", year: "numeric", month: "long", day: "numeric" });

  return (
    <main style={{ minHeight: "100vh", background: "#fff", color: "#111", fontFamily: "system-ui, sans-serif", padding: "32px 16px", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>{shop?.name}</h1>
        <p style={{ margin: 0, color: "#555", fontSize: 13.5 }}>{[shop?.street_address, shop?.city, shop?.province].filter(Boolean).join(", ")}{shop?.phone ? ` · ${shop.phone}` : ""}</p>
        {shop?.tax_number && <p style={{ margin: "4px 0 0", color: "#555", fontSize: 13.5 }}>GST/HST #: {shop.tax_number}</p>}
        <hr style={{ margin: "18px 0", border: "none", borderTop: "1px solid #ddd" }} />
        <p style={{ margin: 0, fontSize: 14 }}><strong>Receipt</strong> · {date}</p>
        <p style={{ margin: "4px 0 0", fontSize: 14 }}>Client: {a.client_name}</p>
        {staff && <p style={{ margin: "4px 0 0", fontSize: 14 }}>Provider: {staff.full_name}{staff.registration_number ? ` · ${staff.registration_body ? `${staff.registration_body} ` : ""}Reg. #${staff.registration_number}` : ""}</p>}
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#777" }}>Receipt no. {String(a.id).slice(0, 8).toUpperCase()}</p>
        <hr style={{ margin: "18px 0", border: "none", borderTop: "1px solid #ddd" }} />
        <div style={row}><span>{a.service_name}</span><span>{money(Number(a.price))}</span></div>
        {lines.length ? lines.map((l) => <div key={l.label} style={row}><span>{l.label}</span><span>{money(Number(l.amount))}</span></div>)
          : tax > 0 && <div style={row}><span>Tax</span><span>{money(tax)}</span></div>}
        {tip > 0 && <div style={row}><span>Tip (not taxed)</span><span>{money(tip)}</span></div>}
        <div style={{ ...row, fontWeight: 800, borderTop: "1px solid #111", marginTop: 6, paddingTop: 10 }}><span>Total paid</span><span>{money(Number(a.paid_amount))}</span></div>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#555", textTransform: "capitalize" }}>Paid by {a.payment_method ?? "card"}</p>
        {Number(a.refunded_amount ?? 0) > 0 && <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgb(220,38,38)" }}>Refunded: {money(Number(a.refunded_amount))}</p>}
      </div>
    </main>
  );
}
