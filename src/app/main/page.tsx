"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LogoIntro from "@/components/LogoIntro";

// Slides already have their heading/subtext baked into the artwork —
// no text overlay needed on top of them.
const SLIDES = [
  { src: "/ca1.jpeg" },
  { src: "/ca2.jpeg" },
  { src: "/ca3.jpeg" },
  { src: "/ca4.jpeg" },
  { src: "/ca5.jpeg" },
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

      {/* Extra concentrated gradient behind the action buttons — the slides
          carry their own text/contrast, this is just for button legibility */}
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
                background: i <= index ? "rgba(15,5,40,0.85)" : "rgba(15,5,40,0.22)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
        <Image src="/logo.svg" alt="FlatPurse Flow" width={82} height={28} style={{ flexShrink: 0 }} />
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
