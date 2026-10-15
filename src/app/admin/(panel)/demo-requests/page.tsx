import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DemoRequestsTable, type DemoRequestRow } from "./DemoRequestsTable";
import { DEMO_STATUSES, DEMO_STATUS_STYLE, type DemoStatus } from "./statuses";

export default async function AdminDemoRequestsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = DEMO_STATUSES.includes(status as DemoStatus) ? (status as DemoStatus) : null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("demo_requests")
    .select("id, name, email, phone, business, business_type, team_size, booking_method, marketing_opt_in, status, created_at")
    .order("created_at", { ascending: false });

  const all = (data ?? []) as DemoRequestRow[];
  const counts = Object.fromEntries(DEMO_STATUSES.map(s => [s, all.filter(r => r.status === s).length])) as Record<DemoStatus, number>;
  const rows = filter ? all.filter(r => r.status === filter) : all;

  const tabs: { key: DemoStatus | null; label: string; count: number }[] = [
    { key: null, label: "All", count: all.length },
    ...DEMO_STATUSES.map(s => ({ key: s, label: DEMO_STATUS_STYLE[s].label, count: counts[s] })),
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ color: "var(--atext2)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Demo Requests</h1>
        <p style={{ color: "var(--aw3)", fontSize: 13, margin: 0 }}>
          {counts.new} new · from the landing page and the /demo walkthrough
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {tabs.map(t => {
          const active = t.key === filter;
          return (
            <Link key={t.label} href={t.key ? `/admin/demo-requests?status=${t.key}` : "/admin/demo-requests"} style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 9,
              fontSize: 12.5, fontWeight: 600, textDecoration: "none",
              background: active ? "rgb(124,58,237)" : "var(--asurface1)",
              border: `1px solid ${active ? "rgb(124,58,237)" : "var(--aw08)"}`,
              color: active ? "white" : "var(--aw55)",
            }}>
              {t.label}
              <span style={{ fontSize: 11, fontWeight: 700, opacity: active ? 0.85 : 0.6 }}>{t.count}</span>
            </Link>
          );
        })}
      </div>

      {error ? (
        <p style={{ color: "var(--ared-text)", fontSize: 13 }}>Couldn&apos;t load demo requests: {error.message}</p>
      ) : rows.length === 0 ? (
        <div style={{ padding: "56px 0", textAlign: "center", color: "var(--aw3)", fontSize: 14, background: "var(--asurface1)", border: "1px solid var(--aw07)", borderRadius: 16 }}>
          {filter ? `No ${DEMO_STATUS_STYLE[filter].label.toLowerCase()} requests.` : "No demo requests yet."}
        </div>
      ) : (
        <DemoRequestsTable rows={rows} />
      )}
    </div>
  );
}
