"use client";

import { useEffect, useRef } from "react";

const WORDS = "Run every booking without lifting a finger. FlatPurse Flow's AI works your calendar, recovers lost revenue from no-shows, and keeps your chairs filled, so you never lose a dollar you already earned.".split(" ");

export default function ScrollFillText() {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let gsap: typeof import("gsap").gsap;
    let ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
    let tween: gsap.core.Tween;

    import("gsap").then((g) => {
      import("gsap/ScrollTrigger").then((st) => {
        gsap = g.gsap;
        ScrollTrigger = st.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        const words = el.querySelectorAll<HTMLSpanElement>(".w");

        tween = gsap.fromTo(
          words,
          { color: "rgba(113,42,226,0.18)" },
          {
            color: "#712AE2",
            stagger: 0.04,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              end: "bottom 15%",
              scrub: 1.2,
            },
          }
        );
      });
    });

    return () => {
      tween?.kill();
    };
  }, []);

  return (
    <p
      ref={ref}
      style={{
        fontSize: "clamp(17px, 1.7vw, 24px)",
        fontWeight: 500,
        lineHeight: 1.6,
        maxWidth: 660,
        margin: 0,
        letterSpacing: "-0.015em",
        textAlign: "center",
      }}
    >
      {WORDS.map((word, i) => (
        <span
          key={i}
          className="w"
          style={{ color: "rgba(113,42,226,0.18)", display: "inline" }}
        >
          {word}{i < WORDS.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
