export const DEMO_STATUSES = ["new", "contacted", "booked", "closed"] as const;
export type DemoStatus = (typeof DEMO_STATUSES)[number];

// Solid fill + white text, same --astatus-* pairs as every other admin badge.
export const DEMO_STATUS_STYLE: Record<DemoStatus, { label: string; bg: string; fg: string }> = {
  new:       { label: "New",       bg: "var(--astatus-purple-bg)", fg: "var(--astatus-purple-fg)" },
  contacted: { label: "Contacted", bg: "var(--astatus-blue-bg)",   fg: "var(--astatus-blue-fg)" },
  booked:    { label: "Booked",    bg: "var(--astatus-green-bg)",  fg: "var(--astatus-green-fg)" },
  closed:    { label: "Closed",    bg: "rgb(71,85,105)",           fg: "rgb(255,255,255)" },
};
