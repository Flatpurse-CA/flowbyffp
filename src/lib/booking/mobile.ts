/** FL-058: service area check by Canadian postal-code prefix (first 3 characters). */
export const fsaOf = (postal: string) => postal.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);

export const validPostal = (postal: string) => /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(postal.toUpperCase().replace(/[^A-Z0-9]/g, ""));

export function inServiceArea(postal: string, fsas: string[]): boolean {
  if (!fsas.length) return true;
  const f = fsaOf(postal);
  return fsas.some((x) => f.startsWith(x.toUpperCase().trim()));
}
