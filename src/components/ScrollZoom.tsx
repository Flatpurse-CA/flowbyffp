"use client";

import { useEffect, useRef, ReactNode } from "react";

interface Props {
  children: ReactNode;
  minScale?: number;
}

export default function ScrollZoom({ children, minScale = 0.72 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // Start zooming when element bottom enters viewport, finish when element center hits viewport center
      const elementCenter = rect.top + rect.height / 2;
      const triggerStart = vh;          // element center at bottom of screen
      const triggerEnd = vh * 0.55;     // element center slightly below mid-screen

      const progress = Math.min(1, Math.max(0, (triggerStart - elementCenter) / (triggerStart - triggerEnd)));
      const scale = minScale + (1 - minScale) * progress;

      el.style.transform = `scale(${scale})`;
      el.style.opacity = String(0.4 + 0.6 * progress);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [minScale]);

  return (
    <div
      ref={ref}
      style={{
        transformOrigin: "center center",
        willChange: "transform, opacity",
        opacity: 0.4,
        transform: `scale(${0.72})`,
      }}
    >
      {children}
    </div>
  );
}
