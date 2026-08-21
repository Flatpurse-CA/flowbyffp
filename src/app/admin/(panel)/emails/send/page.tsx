import { createAdminClient } from "@/lib/supabase/admin";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BlastForm } from "./BlastForm";

export default async function SendBlastPage() {
  const admin = createAdminClient();

  const { data: sequences } = await admin
    .from("email_sequences")
    .select("id, name, subject, body")
    .eq("is_active", true)
    .order("position", { ascending: true });

  const { count: totalSubs } = await admin
    .from("waitlist")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/admin/emails" style={{ color: "var(--aw35)", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 style={{ color: "var(--atext2)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>
            Send Blast
          </h1>
          <p style={{ color: "var(--aw35)", fontSize: 13, margin: 0 }}>
            {totalSubs ?? 0} subscribers on the waitlist
          </p>
        </div>
      </div>

      <BlastForm sequences={sequences ?? []} totalSubs={totalSubs ?? 0} />
    </div>
  );
}
