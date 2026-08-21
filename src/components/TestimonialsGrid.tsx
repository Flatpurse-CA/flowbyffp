"use client";

import AutoPilotChip from "@/components/AutoPilotChip";

const BRAND_PURPLE = "#712AE2";

function Stars() {
  return (
    <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={BRAND_PURPLE}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

const TESTIMONIALS = [
  {
    name: "Ade Williams",
    shop: "Williams Barbershop",
    type: "Barbershop",
    quote: "No-shows dropped by 80% in the first month alone. I didn't change anything about how I run my shop, Flow just handled it.",
    img: "/sd1.jpg",
    featured: true,
  },
  {
    name: "Temi Okafor",
    shop: "The Curl Studio",
    type: "Hair Salon",
    quote: "AutoPilot books clients while I sleep. I wake up to a full calendar every single morning.",
    img: "/sd2.jpg",
    featured: false,
  },
  {
    name: "Seun Adeyemi",
    shop: "Fade Factory",
    type: "Barbershop",
    quote: "The AI front desk handles every DM. I haven't had to reply to a booking request in weeks.",
    img: "/sd4.jpg",
    featured: false,
  },
  {
    name: "Chioma Eze",
    shop: "Glow Beauty Lounge",
    type: "Nail & Beauty",
    quote: "My clients love the booking page. Seamless, professional. It's exactly what we needed to look legit.",
    img: "/make-up-artist-working-medium-shot.jpg",
    featured: false,
  },
  {
    name: "Kola Mensah",
    shop: "Precision Cuts",
    type: "Barbershop",
    quote: "Revenue up 35% in two months. The win-back flow alone paid for the whole year.",
    img: "/sd5.jpg",
    featured: false,
  },
  {
    name: "Femi & Dami",
    shop: "Kings & Queens Cuts",
    type: "Unisex Salon",
    quote: "We used to lose thousands a month to cancellations. That money stays with us now.",
    img: "/sd3.jpg",
    featured: false,
  },
];

export default function TestimonialsGrid() {
  const [featured, ...rest] = TESTIMONIALS;

  return (
    <section style={{ background: "#080808", padding: "100px 155px 120px" }}>
      <style>{`
        .tg-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 28px;
          transition: border-color 0.25s, background 0.25s;
        }
        .tg-card:hover {
          border-color: rgba(113,42,226,0.35);
          background: rgba(113,42,226,0.04);
        }
        .tg-featured {
          background: rgba(113,42,226,0.08);
          border: 1px solid rgba(113,42,226,0.25);
          border-radius: 16px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 64 }}>
        <div>
          <AutoPilotChip theme="dark" words={["Real", "shops.", "Real", "results."]} />
          <h2 style={{
            fontSize: "clamp(32px, 4vw, 54px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.08,
            color: "#fff",
            margin: 0,
          }}>
            Owners who switched<br />
            never looked back.
          </h2>
        </div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", maxWidth: 280, textAlign: "right", margin: 0 }}>
          Trusted by independent salons and barbershops across Canada.
        </p>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

        {/* Featured card — spans 1 col, full height */}
        <div className="tg-featured">
          <div>
            <Stars />
            <p style={{
              fontSize: "clamp(18px, 2vw, 24px)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.45,
              letterSpacing: "-0.02em",
              margin: "0 0 32px",
            }}>
              "{featured.quote}"
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={featured.img}
              alt={featured.name}
              style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", objectPosition: "top", flexShrink: 0 }}
            />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>{featured.name}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "2px 0 0" }}>{featured.shop}</p>
            </div>
            <span style={{
              marginLeft: "auto",
              fontSize: 11,
              fontWeight: 600,
              color: BRAND_PURPLE,
              background: "rgba(113,42,226,0.15)",
              border: "1px solid rgba(113,42,226,0.25)",
              borderRadius: 20,
              padding: "3px 10px",
              whiteSpace: "nowrap",
            }}>
              {featured.type}
            </span>
          </div>
        </div>

        {/* Right two columns — 2-col grid of regular cards */}
        <div style={{ gridColumn: "span 2", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {rest.map((t) => (
            <div key={t.name} className="tg-card">
              <Stars />
              <p style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.65,
                margin: "0 0 24px",
              }}>
                "{t.quote}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto" }}>
                <img
                  src={t.img}
                  alt={t.name}
                  style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", objectPosition: "top", flexShrink: 0 }}
                />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>{t.shop}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Bottom stat bar */}
      <div style={{
        marginTop: 64,
        paddingTop: 40,
        borderTop: "1px solid rgba(255,255,255,0.07)",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 32,
      }}>
        {[
          { n: "80%", label: "average drop in no-shows" },
          { n: "35%", label: "average revenue increase in 60 days" },
          { n: "10h+", label: "saved per week on admin work" },
        ].map(({ n, label }) => (
          <div key={n} style={{ textAlign: "center" }}>
            <p style={{ fontSize: "clamp(32px, 3.5vw, 48px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", margin: 0 }}>
              {n}
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "6px 0 0" }}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
