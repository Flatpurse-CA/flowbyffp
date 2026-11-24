import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptAnswers, intakeConfigured } from "@/lib/intake/crypto";
import type { IntakeField } from "@/lib/intake/templates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Intake form", robots: { index: false, follow: false } };

async function load(token: string) {
  const admin = createAdminClient();
  const { data: a } = await admin.from("appointments").select("id, shop_id, client_name").eq("manage_token", token).maybeSingle();
  if (!a) return null;
  const { data: form } = await admin.from("intake_forms").select("id, name, fields").eq("shop_id", a.shop_id).eq("active", true).order("created_at").limit(1).maybeSingle();
  const { data: done } = await admin.from("intake_responses").select("id").eq("appointment_id", a.id).limit(1);
  return { admin, a, form, done: Boolean(done?.length) };
}

async function submit(formData: FormData) {
  "use server";
  const token = String(formData.get("token") ?? "");
  if (!/^[a-f0-9]{24}$/.test(token) || !intakeConfigured()) return;
  const r = await load(token);
  if (!r?.form || r.done) return;
  const answers: Record<string, string> = {};
  for (const f of r.form.fields as IntakeField[]) answers[f.id] = String(formData.get(f.id) ?? "").slice(0, 4000);
  await r.admin.from("intake_responses").insert({ shop_id: r.a.shop_id, form_id: r.form.id, appointment_id: r.a.id, client_name: r.a.client_name, answers_enc: encryptAnswers({ fields: r.form.fields, answers }) });
}

const field: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 10, padding: "10px 12px", fontSize: 15, fontFamily: "inherit" };

/** Client fills the shop's intake form from their booking link (FL-043). */
export default async function IntakePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-f0-9]{24}$/.test(token)) notFound();
  const r = await load(token);
  if (!r?.form) notFound();
  return (
    <main style={{ minHeight: "100vh", background: "#faf9fb", color: "#111", fontFamily: "system-ui, sans-serif", padding: "32px 16px", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 14 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>{r.form.name as string}</h1>
        {r.done ? <p style={{ margin: 0 }}>Thanks, your form is in. Only your provider can see it.</p> : (
          <form action={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input type="hidden" name="token" value={token} />
            {(r.form.fields as IntakeField[]).map((f) => (
              <label key={f.id} style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14.5, fontWeight: 600 }}>
                {f.label}{f.required ? " *" : ""}
                {f.type === "long" ? <textarea name={f.id} required={f.required} rows={3} style={field} />
                  : f.type === "yesno" ? <select name={f.id} required={f.required} style={field}><option value="">Choose</option><option>Yes</option><option>No</option></select>
                  : <input name={f.id} required={f.required} style={field} />}
              </label>
            ))}
            <p style={{ margin: 0, color: "#555", fontSize: 13 }}>Your answers are encrypted and only seen by your provider and the business owner.</p>
            <button type="submit" style={{ background: "rgb(109,40,217)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Submit</button>
          </form>
        )}
      </div>
    </main>
  );
}
