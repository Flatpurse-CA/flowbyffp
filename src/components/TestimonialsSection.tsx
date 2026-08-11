"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AutoPilotChip from "@/components/AutoPilotChip";

const BRAND_PURPLE = "#712AE2";

const TESTIMONIALS = [
  {
    name: "Ade Williams",
    shop: "Williams Barbershop",
    type: "Barbershop",
    typeColor: "#a855f7",
    quote: "FlatPurse Flow completely changed how I run my shop. No-shows dropped by 80% in the first month.",
    img: "/sd1.jpg",
  },
  {
    name: "Temi Okafor",
    shop: "The Curl Studio",
    type: "Hair Salon",
    typeColor: "#22c55e",
    quote: "AutoPilot books clients while I sleep. I wake up to a full calendar every single morning.",
    img: "/sd2.jpg",
  },
  {
    name: "Femi & Dami",
    shop: "Kings & Queens Cuts",
    type: "Unisex Salon",
    typeColor: "#f59e0b",
    quote: "We used to lose thousands a month to cancellations. That money stays with us now.",
    img: "/sd3.jpg",
  },
  {
    name: "Seun Adeyemi",
    shop: "Fade Factory",
    type: "Barbershop",
    typeColor: "#a855f7",
    quote: "The AI front desk handles every DM. I haven't replied to a booking request in weeks.",
    img: "/sd4.jpg",
  },
  {
    name: "Chioma Eze",
    shop: "Glow Beauty Lounge",
    type: "Nail & Beauty",
    typeColor: "#ec4899",
    quote: "My clients love the booking page. It's seamless and professional, exactly what we needed.",
    img: "/make-up-artist-working-medium-shot.jpg",
  },
  {
    name: "Kola Mensah",
    shop: "Precision Cuts",
    type: "Barbershop",
    typeColor: "#a855f7",
    quote: "Revenue up 35% in two months. The win-back flow alone paid for the whole year.",
    img: "/sd5.jpg",
  },
  {
    name: "Yetunde Bello",
    shop: "Luxe Locs Studio",
    type: "Hair Salon",
    typeColor: "#22c55e",
    quote: "I finally feel like a business owner, not just a stylist chasing payments all day.",
    img: "/sd6.jpg",
  },
];

export default function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 360 : -360, behavior: "smooth" });
  };

  return (
    <section style={{ background: "#000000", padding: "100px 0 120px", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "0 155px", marginBottom: 64 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 60 }}>
          {/* Left */}
          <div style={{ flex: "0 0 auto", maxWidth: 560 }}>
            <AutoPilotChip theme="dark" words={["Trusted", "by", "128+", "owners."]} />

            <h2 style={{
              fontSize: "clamp(32px, 4vw, 54px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.08,
              color: "#fff",
              margin: 0,
            }}>
              Trusted by <span style={{ color: BRAND_PURPLE }}>128+</span><br />
              shop owners.
            </h2>
          </div>

          {/* Right */}
          <div style={{ flex: "0 0 auto", maxWidth: 400 }}>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: "0 0 28px" }}>
              From barbershops to beauty lounges, shop owners using FlatPurse Flow recover more revenue and spend less time on admin.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <a href="/signup" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: BRAND_PURPLE,
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                padding: "13px 24px",
                borderRadius: 10,
                textDecoration: "none",
                letterSpacing: "-0.01em",
              }}>
                Get started free <ArrowRight size={14} />
              </a>

              {/* Arrows */}
              <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                {(["left", "right"] as const).map((dir) => (
                  <button
                    key={dir}
                    onClick={() => scroll(dir)}
                    style={{
                      all: "unset",
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      border: "1px solid rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "rgba(255,255,255,0.7)",
                      transition: "border-color 0.2s, color 0.2s",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = BRAND_PURPLE;
                      (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)";
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
                    }}
                  >
                    {dir === "left" ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <style>{`
        .t-card { cursor: pointer; }
        .t-card .t-panel {
          transform: translateY(100%);
          transition: transform 0.45s cubic-bezier(0.16,1,0.3,1);
        }
        .t-card:hover .t-panel { transform: translateY(0); }
        .t-card .t-quote {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.3s ease 0.18s, transform 0.4s cubic-bezier(0.16,1,0.3,1) 0.18s;
        }
        .t-card:hover .t-quote { opacity: 1; transform: translateY(0); }
        .t-card .t-meta {
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.3s ease 0.26s, transform 0.4s cubic-bezier(0.16,1,0.3,1) 0.26s;
        }
        .t-card:hover .t-meta { opacity: 1; transform: translateY(0); }
      `}</style>
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: 16,
          paddingLeft: 155,
          paddingRight: 155,
          overflowX: "auto",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        } as React.CSSProperties}
      >
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="t-card" style={{
            flexShrink: 0,
            width: 300,
            height: 400,
            borderRadius: 16,
            overflow: "hidden",
            position: "relative",
          }}>
            {/* Photo */}
            <img
              src={t.img}
              alt={t.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {/* Type pill — always visible top-right */}
            <div style={{
              position: "absolute",
              top: 14,
              right: 14,
              background: t.typeColor,
              borderRadius: 999,
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: 600,
              color: "#fff",
              whiteSpace: "nowrap",
              zIndex: 2,
            }}>
              {t.type}
            </div>
            {/* White hover panel */}
            <div className="t-panel" style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.88) 100%)",
              padding: "22px 20px 20px",
              zIndex: 3,
            }}>
              <p className="t-quote" style={{
                fontSize: 13.5,
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.65,
                fontStyle: "italic",
                margin: "0 0 14px",
              }}>
                "{t.quote}"
              </p>
              <div className="t-meta" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 2px", letterSpacing: "-0.02em" }}>
                    {t.name}
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                    {t.shop}
                  </p>
                </div>
                <div style={{
                  background: t.typeColor,
                  borderRadius: 999,
                  padding: "4px 12px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}>
                  {t.type}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
