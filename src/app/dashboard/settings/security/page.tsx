import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { TwoStep } from "./TwoStep";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  if (!(await getShopContext())) redirect("/dashboard");
  return <TwoStep />;
}
