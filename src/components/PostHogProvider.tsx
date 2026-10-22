"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { createClient } from "@/lib/supabase/client";
import { CONSENT_CHANGE_EVENT, hasMarketingConsent } from "@/lib/consent";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const UI_HOST = process.env.NEXT_PUBLIC_POSTHOG_UI_HOST ?? "https://us.posthog.com";

// Signed-in areas show other people's data (client names, phones, bookings),
// so replays there keep layout and clicks but mask every piece of text.
const PRIVATE_AREAS = ["/dashboard", "/staff", "/customer", "/onboarding"];

function areaOf(pathname: string): string {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  const hit = PRIVATE_AREAS.find((p) => pathname === p || pathname.startsWith(`${p}/`));
  return hit ? hit.slice(1) : "public";
}

export default function PostHogProvider() {
  const pathname = usePathname();
  const initialised = useRef(false);
  const [active, setActive] = useState(false);

  // Capture only after the visitor accepts the cookie banner (same gate as the
  // Meta Pixel), and stop again if they later reject.
  useEffect(() => {
    if (!KEY) return;

    const sync = () => {
      if (hasMarketingConsent()) {
        if (!initialised.current) {
          posthog.init(KEY, {
            api_host: "/ingest",
            ui_host: UI_HOST,
            defaults: "2025-11-30",
            person_profiles: "identified_only",
            capture_pageview: false,
            capture_pageleave: true,
            session_recording: { maskAllInputs: true },
          });
          initialised.current = true;
        } else {
          posthog.opt_in_capturing();
        }
        setActive(true);
      } else {
        if (initialised.current) posthog.opt_out_capturing();
        setActive(false);
      }
    };

    sync();
    window.addEventListener(CONSENT_CHANGE_EVENT, sync);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, sync);
  }, []);

  // Tie replays and events to the signed-in account so a person can be found
  // and followed through the app.
  useEffect(() => {
    if (!active) return;
    const supabase = createClient();
    const apply = (user: { id: string; email?: string | null } | null | undefined) => {
      if (user) {
        posthog.identify(user.id, user.email ? { email: user.email } : undefined);
      } else if (posthog._isIdentified()) {
        posthog.reset();
      }
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session?.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user));
    return () => data.subscription.unsubscribe();
  }, [active]);

  // One pageview per navigation, tagged with the app area.
  useEffect(() => {
    if (!active || !pathname) return;
    const area = areaOf(pathname);

    // Admin is never recorded.
    if (area === "admin") {
      posthog.stopSessionRecording();
      return;
    }

    document.body.classList.toggle("ph-mask", area !== "public");
    posthog.register({ area });
    posthog.startSessionRecording();
    posthog.capture("$pageview", { $current_url: window.location.href });
  }, [active, pathname]);

  return null;
}
