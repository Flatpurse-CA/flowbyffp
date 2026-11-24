"use client";

import { useEffect } from "react";

/** FL-077: keeps today's schedule on the device so /offline.html can show it without signal. */
export function TodayCache() {
  useEffect(() => {
    const save = async () => {
      if (!navigator.onLine) return;
      try {
        const r = await fetch("/api/today", { cache: "no-store" });
        if (!r.ok) return;
        const { items } = await r.json();
        localStorage.setItem("flow-today", JSON.stringify({ savedAt: new Date().toISOString(), items }));
      } catch { /* offline or storage blocked */ }
    };
    save();
    const t = setInterval(save, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);
  return null;
}
