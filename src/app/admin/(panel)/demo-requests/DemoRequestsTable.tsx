import { Trash2 } from "lucide-react";
import { deleteDemoRequest } from "./actions";
import { StatusSelect } from "./StatusSelect";
import type { DemoStatus } from "./statuses";

export type DemoRequestRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  business: string;
  business_type: string | null;
  team_size: string | null;
  booking_method: string | null;
  marketing_opt_in: boolean;
  status: DemoStatus;
  created_at: string;
};

const th: React.CSSProperties = {
  padding: "11px 14px", textAlign: "left", color: "var(--aw3)", fontSize: 11,
  fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
  borderBottom: "1px solid var(--aw06)", whiteSpace: "nowrap",
};
const td: React.CSSProperties = { padding: "12px 14px", fontSize: 12.5, color: "var(--aw55)", verticalAlign: "middle" };
const dash = <span style={{ color: "var(--aw18)" }}>-</span>;

export function DemoRequestsTable({ rows }: { rows: DemoRequestRow[] }) {
  return (
    <div style={{ background: "var(--asurface1)", border: "1px solid var(--aw07)", borderRadius: 16, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
        <thead>
          <tr style={{ background: "var(--aw015)" }}>
            {["Contact", "Business", "Team", "Books via", "Requested", "Status", ""].map(h => <th key={h} style={th}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--aw04)" : "none" }}>
              <td style={td}>
                <p style={{ color: "var(--atext2)", fontWeight: 600, margin: "0 0 2px", whiteSpace: "nowrap" }}>{r.name}</p>
                <a href={`mailto:${r.email}`} style={{ color: "var(--aviolet-text)", fontSize: 11.5, textDecoration: "none" }}>{r.email}</a>
                {r.phone && <p style={{ color: "var(--aw42)", fontSize: 11.5, margin: "2px 0 0" }}><a href={`tel:${r.phone}`} style={{ color: "inherit", textDecoration: "none" }}>{r.phone}</a></p>}
              </td>
              <td style={td}>
                <p style={{ color: "var(--atext2)", margin: "0 0 2px" }}>{r.business}</p>
                <p style={{ color: "var(--aw42)", fontSize: 11.5, margin: 0 }}>
                  {r.business_type ?? "Type not given"}{r.marketing_opt_in ? " · Opted in to marketing" : ""}
                </p>
              </td>
              <td style={{ ...td, whiteSpace: "nowrap" }}>{r.team_size ?? dash}</td>
              <td style={td}>{r.booking_method ?? dash}</td>
              <td style={{ ...td, color: "var(--aw35)", whiteSpace: "nowrap" }}>
                {new Date(r.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
              </td>
              <td style={td}><StatusSelect id={r.id} status={r.status} /></td>
              <td style={{ ...td, textAlign: "right" }}>
                <form action={deleteDemoRequest}>
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" title="Delete request" style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 28, height: 28, borderRadius: 8, cursor: "pointer",
                    background: "var(--asurface1)", border: "1px solid var(--aw08)", color: "var(--aw4)",
                  }}>
                    <Trash2 size={12} />
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
