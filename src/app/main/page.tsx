"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LogoIntro from "@/components/LogoIntro";

const SLIDES = [
  {
    src: "/make-up-artist-working-medium-shot.jpg",
    heading: "Book any service, instantly.",
    sub: "Clients book online 24/7 — no more back-and-forth texts.",
  },
  {
    src: "/sd2.jpg",
    heading: "AutoPilot fills your empty chairs.",
    sub: "AI recovers lost revenue while you're off the clock. Zero commission.",
  },
  {
    src: "/sd5.jpg",
    heading: "Every client, remembered.",
    sub: "Preferences, history, and reminders — handled automatically.",
  },
];

const AUTO_ADVANCE_MS = 4500;
// Height reserved at the bottom for the CTA buttons — the tap/swipe zone
// stops above this line so it can never intercept a button press.
const ACTION_ZONE_HEIGHT = 190;

export default function MainSplashPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, AUTO_ADVANCE_MS);
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (i: number) => {
    setIndex((i + SLIDES.length) % SLIDES.length);
    resetTimer();
  };

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const tappedRight = e.clientX - left > width / 2;
    goTo(index + (tappedRight ? 1 : -1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      goTo(index + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  };

  const slide = SLIDES[index];

  return (
    <div style={{ position: "relative", height: "100dvh", width: "100%", overflow: "hidden", background: "#0a0a0a" }}>
      {/* Background image per slide */}
      {SLIDES.map((s, i) => (
        <div
          key={s.src}
          style={{
            position: "absolute", inset: 0,
            opacity: i === index ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <Image src={s.src} alt="" fill priority={i === 0} sizes="100vw" style={{ objectFit: "cover" }} />
        </div>
      ))}

      {/* Dark gradient for text legibility, top-to-bottom — heavier through the
          heading/subtext band (~28%-65%) so white text holds up over bright images */}
      <div
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 18%, rgba(0,0,0,0.5) 32%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.88) 88%, rgba(0,0,0,0.97) 100%)",
        }}
      />
      {/* Extra concentrated gradient behind the action buttons */}
      <div
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: 260, pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.97) 100%)",
        }}
      />

      {/* Tap / swipe zone — covers everything ABOVE the button area only */}
      <div
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: ACTION_ZONE_HEIGHT, zIndex: 1 }}
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />

      {/* Top bar: pagination dots + logo */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 2,
          padding: "calc(env(safe-area-inset-top, 20px) + 12px) 20px 0",
          display: "flex", alignItems: "center", gap: 12,
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", gap: 6, flex: 1, pointerEvents: "auto" }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                flex: 1, height: 3, borderRadius: 2, border: "none", padding: 0, cursor: "pointer",
                background: i <= index ? "white" : "rgba(255,255,255,0.3)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
        <Image src="/group-starter.svg" alt="FlatPurse Flow" width={82} height={23} style={{ flexShrink: 0 }} />
      </div>

      {/* Heading */}
      <div style={{ position: "absolute", left: 20, right: 20, top: "46%", zIndex: 2, pointerEvents: "none" }}>
        <h1
          key={slide.heading}
          style={{
            color: "white", fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em",
            lineHeight: 1.12, margin: "0 0 12px",
            animation: "fp-fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {slide.heading}
        </h1>
        <p
          key={slide.sub}
          style={{
            color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 1.5, margin: 0, maxWidth: 320,
            animation: "fp-fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 60ms both",
          }}
        >
          {slide.sub}
        </p>
      </div>

      {/* Bottom actions — outside the tap/swipe zone entirely */}
      <div
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 3,
          padding: "0 20px calc(env(safe-area-inset-bottom, 20px) + 20px)",
          display: "flex", flexDirection: "column", gap: 10,
        }}
      >
        <button
          onClick={() => router.push("/signup")}
          style={{
            width: "100%", padding: "16px", borderRadius: 14, border: "none",
            background: "rgb(109,40,217)", color: "white",
            fontSize: 15.5, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 8px 28px rgba(109,40,217,0.4)",
          }}
        >
          Get started
        </button>
        <button
          onClick={() => router.push("/login")}
          style={{
            width: "100%", padding: "16px", borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.06)", color: "white",
            fontSize: 15.5, fontWeight: 700, cursor: "pointer",
            backdropFilter: "blur(6px)",
          }}
        >
          Log in
        </button>
      </div>

      {showIntro && <LogoIntro onDone={() => setShowIntro(false)} />}
    </div>
  );
}
