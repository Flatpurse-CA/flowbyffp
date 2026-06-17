"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    src: "/sd1.jpg",
    tagline: "Your Clients, Your Brand",
    sub: "Beautiful booking pages that represent your business.",
  },
  {
    src: "/sd2.jpg",
    tagline: "Book smarter. Grow faster.",
    sub: "The all-in-one platform for modern salons.",
  },
  {
    src: "/sd3.jpg",
    tagline: "Your salon, fully booked.",
    sub: "Set up your shop and start taking appointments today.",
  },
  {
    src: "/sd4.jpg",
    tagline: "Every seat, every day.",
    sub: "Let clients book online 24/7 without the back-and-forth.",
  },
  {
    src: "/sd5.jpg",
    tagline: "Built for beauty professionals.",
    sub: "From solo stylists to multi-chair studios.",
  },
  {
    src: "/sd6.jpg",
    tagline: "No-shows? Never again.",
    sub: "Automated reminders keep your calendar full.",
  },
  {
    src: "/sd7.jpg",
    tagline: "Your brand, your way.",
    sub: "Custom booking pages that look like you.",
  },
  {
    src: "/sd8.jpg",
    tagline: "Grow with confidence.",
    sub: "Analytics and insights to help your salon thrive.",
  },
];

const easing = "cubic-bezier(0.16, 1, 0.3, 1)";

export function AuthImagePanel({ isExiting }: { isExiting?: boolean }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="relative hidden h-full w-1/2 p-3 lg:block"
      style={{
        animation: `0.6s ${easing} 0ms 1 normal both running fp-slide-in-l`,
        transition: "opacity 0.38s ease, transform 0.44s cubic-bezier(0.4,0,0.2,1)",
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? "translateX(-56px) scale(0.97)" : "translateX(0) scale(1)",
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-zinc-900">
        {/* Logo over image */}
        <div className="absolute left-6 top-6 z-20">
          <img src="/main%20logo.png" alt="FLOWBYFFP" className="h-8 w-auto" />
        </div>

        {/* Slides */}
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.tagline}
              fill
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}

        {/* Bottom overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-8 pb-8 pt-32">
          <p className="text-xl font-semibold text-white">{SLIDES[active].tagline}</p>
          <p className="mt-1 text-sm text-zinc-400">{SLIDES[active].sub}</p>
          <div className="mt-4 flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-6 bg-violet-500" : "w-2 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
