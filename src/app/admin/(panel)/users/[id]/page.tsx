import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, UserX, UserCheck, Trash2, Send, ExternalLink, KeyRound } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadAccounts, initialsOf, needsShopSetup } from "@/lib/admin/accounts";
import { computeAccessStatus } from "@/lib/dashboard/accessStatus";
import { formatCAD, planLabel, ADMIN_PLAN_BADGE } from "@/lib/plans";
import { banUser, unbanUser, deleteUser, sendSetupReminder } from "../actions";
import { addAdmin, removeAdmin } from "../../settings/actions";
import { pill, fmtDate } from "../AccountsTable";

const KIND_LABEL = { owner: "Shop owner", client: "Client", team: "Team member" } as const;
const KIND_LIST = { owner: "/admin/users", client: "/admin/users/clients", team: "/admin/users/team" } as const;
const TRIAL_PILL = {
  trialing: ["Trialing", "blue"], grace: ["Grace", "amber"], inactive: ["Locked out", "red"], active: ["Active", "green"], paused: ["Paused", "purple"],
} as const;

const card: React.CSSProperties = { background: "var(--asurface1)", border: "1px solid var(--aw07)", borderRadius: 16, padding: "20px 22px" };
const cardTitle: React.CSSProperties = { color: "var(--aw35)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" };
const btn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px", borderRadius: 9, cursor: "pointer",
  fontSize: 12.5, fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap", textDecoration: "none",
  background: "var(--asurface1)", border: "1px solid var(--aw08)", color: "var(--atext2)",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ minWidth: 0 }}>
      <p style={{ color: "var(--aw35)", fontSize: 11.5, margin: "0 0 4px" }}>{label}</p>
      <div style={{ color: "var(--atext2)", fontSize: 13.5, fontWeight: 500, overflowWrap: "anywhere" }}>{children}</div>
    </div>
  );
}
const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "18px 24px" };

export default async function AdminUserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const accounts = await loadAccounts();
  const a = accounts.find(x => x.user.id === id);
  if (!a) notFound();

  const admin = createAdminClient();
  const [shopApptsRes, teamRes, clientApptsRes] = await Promise.all([
    a.shop ? admin.from("appointments").select("status, price").eq("shop_id", a.shop.id) : Promise.resolve({ data: null }),
    a.shop ? admin.from("staff").select("id", { count: "exact", head: true }).eq("shop_id", a.shop.id).eq("active", true) : Promise.resolve({ count: null }),
    a.customer
      ? admin.from("appointments").select("id, shop_id, service_name, starts_at, status, price").eq("customer_id", a.customer.id).order("starts_at", { ascending: false }).limit(25)
      : a.staff
        ? admin.from("appointments").select("id, shop_id, service_name, starts_at, status, price").eq("staff_id", a.staff.id).order("starts_at", { ascending: false }).limit(25)
        : Promise.resolve({ data: null }),
  ]);
  const shopNames = new Map(accounts.filter(x => x.shop).map(x => [x.shop!.id, x.shop!.name]));
  const shopAppts = (shopApptsRes.data ?? []) as { status: string; price: number }[];
  const revenue = shopAppts.filter(ap => ap.status === "completed").reduce((t, ap) => t + (Number(ap.price) || 0), 0);
  const bookings = (clientApptsRes.data ?? []) as { id: string; shop_id: string; service_name: string; starts_at: string; status: string; price: number }[];

  const provider = (a.user.app_metadata?.provider as string | undefined) ?? "email";
  const listHref = KIND_LIST[a.kind];
  const access = a.shop?.trial_started_at
    ? computeAccessStatus({ trial_started_at: a.shop.trial_started_at, subscription_status: a.shop.subscription_status, trial_override: a.shop.trial_override, trial_paused_at: a.shop.trial_paused_at }).status
    : null;
  const unlimited = a.shop ? a.shop.trial_override && a.shop.plan === "enterprise" : !!a.user.app_metadata?.unlimited;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1100 }}>
      <Link href={listHref} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--aw45)", fontSize: 13, textDecoration: "none", width: "fit-content" }}>
        <ArrowLeft size={14} /> Back to {a.kind === "owner" ? "owners" : a.kind === "client" ? "clients" : "team"}
      </Link>

      {/* Header */}
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 32, flexShrink: 0, background: "hsl(265, 35%, var(--aavatar-l, 22%))",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--aavatar-fg, var(--aw85))", fontSize: 20, fontWeight: 800, opacity: a.isBanned ? 0.5 : 1,
        }}>
          {initialsOf(a.name, a.user.email ?? "")}
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h1 style={{ color: "var(--atext2)", fontSize: 21, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.02em" }}>{a.name ?? a.user.email}</h1>
          <p style={{ color: "var(--aw45)", fontSize: 13, margin: "0 0 10px" }}>{a.user.email}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {pill(KIND_LABEL[a.kind], "blue")}
            {a.isAdmin && pill("Admin", "purple")}
            {a.isBanned && pill("Banned", "red")}
            {!a.emailConfirmed && pill("Email not verified", "amber")}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {needsShopSetup(a) && (
            <form action={sendSetupReminder}>
              <input type="hidden" name="userId" value={a.user.id} />
              <button type="submit" style={btn}><Send size={13} /> Send setup reminder</button>
            </form>
          )}
          {!a.isRootAdmin && a.user.email && (
            <form action={a.isAdmin ? removeAdmin : addAdmin}>
              <input type="hidden" name="email" value={a.user.email} />
              <button type="submit" style={btn}><KeyRound size={13} /> {a.isAdmin ? "Remove admin" : "Make admin"}</button>
            </form>
          )}
          <form action={a.isBanned ? unbanUser : banUser}>
            <input type="hidden" name="userId" value={a.user.id} />
            <button type="submit" style={{ ...btn, background: a.isBanned ? "var(--astatus-green-bg)" : "var(--astatus-red-bg)", border: "none", color: "white" }}>
              {a.isBanned ? <><UserCheck size={13} /> Unban</> : <><UserX size={13} /> Ban</>}
            </button>
          </form>
          <form action={deleteUser}>
            <input type="hidden" name="userId" value={a.user.id} />
            <input type="hidden" name="redirectTo" value={listHref} />
            <button type="submit" title="Delete user" style={{ ...btn, color: "var(--ared-text)" }}><Trash2 size={13} /> Delete</button>
          </form>
        </div>
      </div>

      {/* Account */}
      <div style={card}>
        <p style={cardTitle}>Account</p>
        <div style={grid}>
          <Field label="Joined">{fmtDate(a.user.created_at)}</Field>
          <Field label="Last sign-in">{a.user.last_sign_in_at ? fmtDate(a.user.last_sign_in_at) : "Never"}</Field>
          <Field label="Email verified">{a.emailConfirmed ? `Yes, ${fmtDate(a.user.email_confirmed_at)}` : "No"}</Field>
          <Field label="Sign-in method">{provider === "email" ? "Email and password" : provider}</Field>
          {a.customer?.phone && <Field label="Phone">{a.customer.phone}</Field>}
          <Field label="User ID"><span style={{ fontSize: 11.5, fontFamily: "ui-monospace, monospace", color: "var(--aw55)" }}>{a.user.id}</span></Field>
        </div>
      </div>

      {/* Owner: their shop */}
      {a.kind === "owner" && (a.shop ? (
        <div style={card}>
          <p style={cardTitle}>Shop</p>
          <div style={grid}>
            <Field label="Name">{a.shop.name}</Field>
            <Field label="Booking page">
              {a.shop.handle
                ? <a href={`/book/${a.shop.handle}`} target="_blank" rel="noreferrer" style={{ color: "var(--aviolet-text)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>/book/{a.shop.handle} <ExternalLink size={12} /></a>
                : "Not set up yet"}
            </Field>
            <Field label="Type">{a.shop.business_type ?? "-"}</Field>
            <Field label="Location">{[a.shop.city, a.shop.province].filter(Boolean).join(", ") || "-"}</Field>
            <Field label="Plan">
              <span style={{ display: "inline-block", fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, color: "white", background: (ADMIN_PLAN_BADGE[a.shop.plan] ?? ADMIN_PLAN_BADGE.starter).bg }}>{planLabel(a.shop.plan)}</span>
            </Field>
            <Field label="Billing">
              {unlimited ? pill("Unlimited", "purple") : a.shop.subscription_status ? pill(a.shop.subscription_status.replace(/_/g, " "), a.shop.subscription_status === "active" ? "green" : "amber") : access ? pill(TRIAL_PILL[access][0], TRIAL_PILL[access][1]) : "-"}
            </Field>
            <Field label="Revenue (completed)">{formatCAD(revenue)}</Field>
            <Field label="Bookings">{shopAppts.length}</Field>
            <Field label="Active team">{teamRes.count ?? 0}</Field>
            <Field label="Shop created">{fmtDate(a.shop.created_at)}</Field>
          </div>
        </div>
      ) : (
        <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p style={{ ...cardTitle, margin: "0 0 6px" }}>Shop</p>
            <p style={{ color: "var(--atext2)", fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Hasn&apos;t set up a shop yet</p>
            <p style={{ color: "var(--aw45)", fontSize: 12.5, margin: 0 }}>
              {!a.emailConfirmed
                ? "They never verified their email, so they can't log in to finish setup."
                : a.setupReminderSentAt
                  ? `Setup reminder last sent ${fmtDate(a.setupReminderSentAt)}. Logging in takes them straight to shop setup.`
                  : "No setup reminder sent yet. Logging in takes them straight to shop setup."}
            </p>
          </div>
        </div>
      ))}

      {/* Team member: where they work */}
      {a.kind === "team" && (
        <div style={card}>
          <p style={cardTitle}>Works at</p>
          <div style={grid}>
            <Field label="Shop">{a.staffShop?.name ?? "-"}</Field>
            <Field label="Role">{a.staff?.role ?? "-"}</Field>
            <Field label="Invite">{a.staff?.invite_status === "active" ? pill("Active", "green") : pill(a.staff?.invite_status ?? "Unknown", "amber")}</Field>
            <Field label="Status">{a.staff?.active === false ? pill("Archived", "slate") : pill("Working", "blue")}</Field>
          </div>
        </div>
      )}

      {/* Client bookings, or a team member's assigned appointments */}
      {(a.kind === "client" || a.kind === "team") && (
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <p style={{ ...cardTitle, padding: "18px 22px 0" }}>{a.kind === "client" ? "Bookings" : "Assigned appointments"} {bookings.length === 25 ? "(latest 25)" : ""}</p>
          {bookings.length === 0 ? (
            <p style={{ color: "var(--aw35)", fontSize: 13, margin: 0, padding: "4px 22px 22px" }}>None yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} style={{ borderTop: "1px solid var(--aw04)" }}>
                      <td style={{ padding: "11px 22px", fontSize: 12.5, color: "var(--aw45)", whiteSpace: "nowrap" }}>{fmtDate(b.starts_at)}</td>
                      <td style={{ padding: "11px 14px", fontSize: 12.5, color: "var(--atext2)" }}>{b.service_name}</td>
                      <td style={{ padding: "11px 14px", fontSize: 12.5, color: "var(--aw55)" }}>{shopNames.get(b.shop_id) ?? "-"}</td>
                      <td style={{ padding: "11px 14px" }}>{pill(b.status.replace(/_/g, " "), b.status === "completed" ? "green" : b.status === "cancelled" || b.status === "no_show" ? "red" : b.status === "pending" || b.status === "deposit" ? "amber" : "blue")}</td>
                      <td style={{ padding: "11px 22px", fontSize: 12.5, color: "var(--aw55)", textAlign: "right", whiteSpace: "nowrap" }}>{formatCAD(Number(b.price) || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
