/**
 * Build a translucent fill from one of the avatar/tag palette colours.
 *
 * The palettes are all `rgb(r,g,b)` strings, so the shorthand of appending a
 * hex alpha pair (`` `${color}22` ``) yields `rgb(52,211,153)22` — not valid
 * CSS. Browsers drop the whole declaration, which is why avatar circles and
 * status tints were rendering fully transparent.
 */
export function tint(color: string, alpha: number): string {
  if (color.startsWith("rgba(")) return color;
  if (color.startsWith("rgb(")) {
    return `${color.slice(0, -1).replace("rgb(", "rgba(")},${alpha})`;
  }
  return color;
}
