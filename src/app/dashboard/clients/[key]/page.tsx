import { redirect } from "next/navigation";
import { getAutopilotEngagedClientNames } from "../../autopilot/actions";
import { getClientWithAppointments } from "@/lib/dashboard/clientSummaries";
import { ClientProfilePage } from "./ClientProfilePage";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ClientDetailPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  // This Next.js version does not auto-decode dynamic segment params — a key
  // like "+1 555-010-0199" arrives as the still-encoded "%2B1%20555-010-0199".
  const [found, engagedNames] = await Promise.all([
    getClientWithAppointments(decodeURIComponent(key)),
    getAutopilotEngagedClientNames(),
  ]);
  if (!found) redirect("/dashboard/clients");
  const { client, appointments } = found;

  const engaged = new Set(engagedNames).has(client.name.trim().toLowerCase());

  return <ClientProfilePage client={client} appointments={appointments} engaged={engaged} />;
}
