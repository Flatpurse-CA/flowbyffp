import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { listServices } from "./actions";
import { ServicesClient } from "./ServicesClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ServicesPage() {
  const ctx = await getShopContext();
  if (ctx && ctx.role !== "owner") redirect("/dashboard");

  const services = ctx ? await listServices() : [];

  return <ServicesClient services={services} />;
}
