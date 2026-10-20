"use client";

// Formats in the viewer's timezone; the server renders in UTC.
export function LocalDateTime({ iso }: { iso: string }) {
  const d = new Date(iso);
  return (
    <>
      <div suppressHydrationWarning style={{ color: "var(--dtext)", fontSize: 13, fontWeight: 600 }}>{d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</div>
      <div suppressHydrationWarning style={{ color: "var(--dw35)", fontSize: 11.5 }}>{d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</div>
    </>
  );
}
