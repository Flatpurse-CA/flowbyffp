import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { getDueClients } from "./actions";
import { QuickBookClient } from "./QuickBookClient";

export const dynamic = "force-dynamic";

export default async function QuickBookPage() {
  if (!(await getShopContext())) redirect("/dashboard");
  return <QuickBookClient due={await getDueClients()} />;
}
