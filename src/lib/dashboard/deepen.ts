// Palette colours (avatars, staff colours, KPI icons) are pastels picked for
// a near-black surface. Used as text on white they read as washed out, so
// this mixes them toward black by --ddeepen: 0% in dark mode (the exact
// original colour) and a fixed amount in light mode. CSS-only, so it also
// works for colours that can't be swapped for a theme token up front.
export function deepen(color: string): string {
  return `color-mix(in srgb, ${color}, black var(--ddeepen, 0%))`;
}
