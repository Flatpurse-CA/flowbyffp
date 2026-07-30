import { redirect } from "next/navigation";
import { listAppointments } from "../../appointments/actions";
import { getAutopilotEngagedClientNames } from "../../autopilot/actions";
import { deriveClients } from "@/lib/dashboard/clients";
import { ClientProfilePage } from "./ClientProfilePage";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ClientDetailPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const now = new Date();
  const rangeStart = new Date(2000, 0, 1);
  const rangeEnd = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const [appointments, engagedNames] = await Promise.all([
    listAppointments(rangeStart.toISOString(), rangeEnd.toISOString()),
    getAutopilotEngagedClientNames(),
  ]);

  const clients = deriveClients(appointments, now);
  const client = clients.find(c => c.key === key);
  if (!client) redirect("/dashboard/clients");

  const engaged = new Set(engagedNames).has(client.name.trim().toLowerCase());

  return <ClientProfilePage client={client} appointments={appointments} engaged={engaged} />;
}
