import { listAppointments } from "../appointments/actions";
import { getAutopilotEngagedClientNames } from "../autopilot/actions";
import { deriveClients } from "@/lib/dashboard/clients";
import { ClientsClient } from "./ClientsClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ClientsPage() {
  const now = new Date();
  const rangeStart = new Date(2000, 0, 1);
  const rangeEnd = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const [appointments, engagedNames] = await Promise.all([
    listAppointments(rangeStart.toISOString(), rangeEnd.toISOString()),
    getAutopilotEngagedClientNames(),
  ]);

  const clients = deriveClients(appointments, now);

  return <ClientsClient clients={clients} engagedNames={engagedNames} />;
}
