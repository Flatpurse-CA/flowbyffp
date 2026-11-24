import { createHmac, timingSafeEqual } from "crypto";

/** Short signed tokens for emailed links (e.g. resume signup). Signed with the service key, never stored. */
const key = () => process.env.SUPABASE_SECRET_KEY ?? "";
const sig = (body: string) => createHmac("sha256", key()).update(body).digest("base64url");

export function signToken(id: string, ttlDays = 7): string {
  const body = `${id}.${Date.now() + ttlDays * 86400000}`;
  return `${Buffer.from(body).toString("base64url")}.${sig(body)}`;
}

export function verifyToken(token: string): string | null {
  const [b, s] = token.split(".");
  if (!b || !s || !key()) return null;
  const body = Buffer.from(b, "base64url").toString();
  const want = Buffer.from(sig(body)); const got = Buffer.from(s);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  const [id, exp] = body.split(".");
  return Number(exp) > Date.now() ? id : null;
}
