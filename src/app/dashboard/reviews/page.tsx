import { Star } from "lucide-react";
import { getCurrentShopId } from "@/lib/dashboard/shop";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const card: React.CSSProperties = {
  background: "var(--dsurface1)",
  border: "1px solid var(--dw07)",
  borderRadius: 16,
  padding: "18px 20px",
};

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={size} color={n <= rating ? "rgb(245,158,11)" : "var(--dw1)"} fill={n <= rating ? "rgb(245,158,11)" : "none"} />
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  const shopId = await getCurrentShopId();
  const supabase = await createClient();

  const { data: reviewsRaw } = shopId
    ? await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, customers(full_name)")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false })
    : { data: null };

  const reviews = (reviewsRaw ?? []).map(r => {
    const rel = r.customers as { full_name: string } | { full_name: string }[] | null;
    const reviewerName = Array.isArray(rel) ? rel[0]?.full_name : rel?.full_name;
    return {
      id: r.id as string,
      rating: r.rating as number,
      comment: r.comment as string | null,
      createdAt: r.created_at as string,
      reviewerName: (reviewerName as string | undefined) ?? "A client",
    };
  });

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
  const distribution = [5, 4, 3, 2, 1].map(n => ({ stars: n, count: reviews.filter(r => r.rating === n).length }));

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));

  return (
    <div style={{ maxWidth: 760, display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Reviews</h1>
        <p style={{ color: "var(--dw35)", fontSize: 13, margin: 0 }}>What clients are saying, straight from your booking page.</p>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div style={{ ...card, flex: "1 1 200px" }}>
          <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 10px" }}>Average rating</p>
          {avgRating != null ? (
            <>
              <p style={{ color: "var(--dtext)", fontSize: 32, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.03em" }}>{avgRating.toFixed(1)}</p>
              <Stars rating={Math.round(avgRating)} size={16} />
            </>
          ) : (
            <p style={{ color: "var(--dw25)", fontSize: 13, margin: 0 }}>No reviews yet</p>
          )}
        </div>

        <div style={{ ...card, flex: "2 1 280px" }}>
          <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 10px" }}>Breakdown</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {distribution.map(d => (
              <div key={d.stars} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--dw4)", fontSize: 11.5, width: 34, flexShrink: 0 }}>{d.stars} star</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--dw06)", overflow: "hidden" }}>
                  <div style={{
                    width: reviews.length > 0 ? `${(d.count / reviews.length) * 100}%` : "0%",
                    height: "100%", background: "rgb(245,158,11)", borderRadius: 3,
                  }} />
                </div>
                <span style={{ color: "var(--dw35)", fontSize: 11.5, width: 18, textAlign: "right", flexShrink: 0 }}>{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {reviews.length === 0 ? (
          <div style={{ ...card, textAlign: "center" }}>
            <p style={{ color: "var(--dw3)", fontSize: 13, margin: 0 }}>No reviews yet — clients can leave one from your booking page after a completed visit.</p>
          </div>
        ) : (
          reviews.map(r => (
            <div key={r.id} style={card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "var(--dtext)", fontSize: 13.5, fontWeight: 700 }}>{r.reviewerName}</span>
                <span style={{ color: "var(--dw3)", fontSize: 12 }}>{fmtDate(r.createdAt)}</span>
              </div>
              <div style={{ marginBottom: r.comment ? 8 : 0 }}>
                <Stars rating={r.rating} />
              </div>
              {r.comment && <p style={{ color: "var(--dw5)", fontSize: 13, margin: 0, lineHeight: 1.55 }}>{r.comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
