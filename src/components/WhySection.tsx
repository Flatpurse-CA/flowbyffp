"use client";

import { useEffect, useRef } from "react";

const BRAND_PURPLE = "#712AE2";

const ROW_ONE = [
  { name: "Ade Williams", shop: "Williams Barbershop", type: "Barbershop", color: "#a855f7", img: "/sd1.jpg" },
  { name: "Temi Okafor", shop: "The Curl Studio", type: "Hair Salon", color: "#22c55e", img: "/sd2.jpg" },
  { name: "Femi & Dami", shop: "Kings & Queens Cuts", type: "Unisex Salon", color: "#f59e0b", img: "/sd3.jpg" },
  { name: "Seun Adeyemi", shop: "Fade Factory", type: "Barbershop", color: "#a855f7", img: "/sd4.jpg" },
  { name: "Chioma Eze", shop: "Glow Beauty Lounge", type: "Nail & Beauty", color: "#ec4899", img: "/make-up-artist-working-medium-shot.jpg" },
];

const ROW_TWO = [
  { name: "Kola Mensah", shop: "Precision Cuts", type: "Barbershop", color: "#a855f7", img: "/sd5.jpg" },
  { name: "Yetunde Bello", shop: "Luxe Locs Studio", type: "Hair Salon", color: "#22c55e", img: "/sd6.jpg" },
  { name: "Emeka Obi", shop: "The Clean Fade", type: "Barbershop", color: "#f59e0b", img: "/sd7.jpg" },
  { name: "Amara Diallo", shop: "Amara Beauty Bar", type: "Beauty Bar", color: "#ec4899", img: "/sd8.jpg" },
  { name: "Dayo & Sons", shop: "Dayo Grooming Co.", type: "Grooming", color: "#06b6d4", img: "/group-young-teens-celebrating-world-youth-day-by-doing-activities-together.jpg" },
];

function PhotoCard({ name, shop, type, color, img }: { name: string; shop: string; type: string; color: string; img: string }) {
  return (
    <div style={{
      flexShrink: 0,
      width: 260,
      height: 320,
      borderRadius: 14,
      overflow: "hidden",
      position: "relative",
    }}>
      <img
        src={img}
        alt={name}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      {/* Gradient overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)",
      }} />
      {/* Text */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "20px 16px",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 8,
      }}>
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 2px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {name}
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: 0 }}>
            {shop}
          </p>
        </div>
        <div style={{
          background: color,
          borderRadius: 999,
          padding: "4px 11px",
          fontSize: 11,
          fontWeight: 600,
          color: "#fff",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}>
          {type}
        </div>
      </div>
    </div>
  );
}

function ScrollRows() {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
      if (row1Ref.current) row1Ref.current.style.transform = `translateX(${-progress * 160}px)`;
      if (row2Ref.current) row2Ref.current.style.transform = `translateX(${-progress * 90}px)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={sectionRef} style={{ marginTop: 56, display: "flex", flexDirection: "column", gap: 10 }}>
      <div ref={row1Ref} style={{ display: "flex", gap: 10, willChange: "transform", paddingLeft: 155 }}>
        {ROW_ONE.map((item, i) => <PhotoCard key={i} {...item} />)}
      </div>
      <div ref={row2Ref} style={{ display: "flex", gap: 10, willChange: "transform", paddingLeft: 155 }}>
        {ROW_TWO.map((item, i) => <PhotoCard key={i} {...item} />)}
      </div>
    </div>
  );
}

export default function WhySection() {
  return (
    <section style={{ background: "#712AE2", padding: "100px 0 120px", overflow: "hidden", marginTop: -1 }}>
      <div style={{ padding: "0 155px" }}>
        {/* Pill */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(113,42,226,0.15)",
          border: "1px solid rgba(113,42,226,0.3)",
          borderRadius: 999,
          padding: "7px 16px",
          marginBottom: 40,
        }}>
          <span style={{ fontSize: 11, color: BRAND_PURPLE }}>✦</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>Why FlatPurse Flow</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "end" }}>
          <h2 style={{
            fontSize: "clamp(32px, 4vw, 54px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.08,
            color: "#fff",
            margin: 0,
          }}>
            One app for bookings,{" "}
            <span style={{ color: BRAND_PURPLE }}>recovery,</span>{" "}
            and zero commission.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: 0 }}>
            FlatPurse Flow brings your calendar, your clients, and your revenue
            into one place, with AI running in the background 24/7.
          </p>
        </div>
      </div>

      <ScrollRows />
    </section>
  );
}
