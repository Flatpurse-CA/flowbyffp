"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const HOLD_MS = 1500;
const FADE_MS = 400;

export default function LogoIntro({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = setTimeout(() => setLeaving(true), HOLD_MS);
    const doneTimer = setTimeout(onDone, HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        opacity: leaving ? 0 : 1,
        transition: `opacity ${FADE_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        pointerEvents: leaving ? "none" : "auto",
      }}
    >
      <div className="ffp-splash-gradient" />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          animation: "fp-logo-reveal 1.1s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        <Image src="/group-starter.svg" alt="FlatPurse Flow" width={200} height={56} priority />
      </div>
    </div>
  );
}
