import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { listImports } from "./actions";
import { MigrateClient } from "./MigrateClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function MigratePage() {
  const ctx = await getShopContext();
  if (ctx && ctx.role !== "owner") redirect("/dashboard");

  const imports = ctx ? await listImports() : [];

  return <MigrateClient imports={imports} />;
}
