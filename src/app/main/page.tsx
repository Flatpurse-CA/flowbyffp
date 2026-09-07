import { redirect } from "next/navigation";
import { getAuthUser, getShopContext } from "@/lib/dashboard/shop";
import { getCustomerContext } from "@/lib/dashboard/customer";
import { MainSplash } from "./MainSplash";

// This is the PWA manifest's start_url — the screen every "installed app"
// launch opens on. It used to always render the anonymous marketing splash,
// so a shop owner who'd been using the app for weeks would open it from
// their home screen and land on "Get started / Log in" instead of their
// dashboard. Route already-signed-in visitors straight to where they
// belong; only show the splash to someone with no session at all.
export default async function MainEntryPage() {
  const user = await getAuthUser();
  if (user) {
    const shopCtx = await getShopContext();
    if (shopCtx) redirect("/dashboard");

    const customerCtx = await getCustomerContext();
    if (customerCtx) redirect("/customer/account");
  }

  return <MainSplash />;
}
