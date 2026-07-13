import { headers } from "next/headers";

// Derives the actual origin the request came in on (e.g. flowbyffp.vercel.app
// today, flowbyffp.co once that domain's DNS is configured) instead of trusting
// NEXT_PUBLIC_SITE_URL to be set correctly everywhere — self-correcting for
// whatever domain is actually live, in dev and in every deployment.
export async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}
