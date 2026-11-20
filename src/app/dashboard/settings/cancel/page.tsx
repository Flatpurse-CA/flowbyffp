import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { getCancelContext } from "./actions";
import { CancelFlow } from "./CancelFlow";

export const dynamic = "force-dynamic";

export default async function CancelPage() {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") redirect("/dashboard");
  const data = await getCancelContext();
  if (!data) redirect("/dashboard/settings?tab=billing");
  return <CancelFlow data={data} />;
}
