import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { getAutopilotState } from "./actions";
import { AutoPilotClient } from "./AutoPilotClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AutoPilotPage() {
  const ctx = await getShopContext();

  if (!ctx) {
    return (
      <div style={{ maxWidth: 460, margin: "100px auto 0", textAlign: "center" }}>
        <h1 style={{ color: "rgb(250,250,250)", fontSize: 19, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Finish setting up your shop
        </h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
          We couldn&apos;t find a shop linked to your account yet. Complete onboarding to unlock AutoPilot.
        </p>
      </div>
    );
  }

  if (ctx.role !== "owner") redirect("/dashboard");

  const state = await getAutopilotState();
  return <AutoPilotClient state={state} />;
}
