import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

export function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--auth-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          animation: "0.4s cubic-bezier(0.16,1,0.3,1) 0ms 1 normal both running fp-fade-in",
        }}
      >
        <Image
          src="/main logo.png"
          alt="FLOWBYFFP"
          width={52}
          height={52}
          style={{ objectFit: "contain" }}
        />
        <ThemeToggle />
      </div>

      {/* Centered content — animates in like it's expanding from the right half */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px 64px",
          animation: "0.55s cubic-bezier(0.16,1,0.3,1) 0ms 1 normal both running fp-fade-up",
        }}
      >
        {children}
      </div>
    </div>
  );
}
