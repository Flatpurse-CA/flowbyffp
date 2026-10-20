import { getAutopilotEngagedClientNames } from "../autopilot/actions";
import { listClientSummaries } from "@/lib/dashboard/clientSummaries";
import { ClientsClient } from "./ClientsClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ClientsPage() {
  const [clients, engagedNames] = await Promise.all([
    listClientSummaries(),
    getAutopilotEngagedClientNames(),
  ]);

  return <ClientsClient clients={clients} engagedNames={engagedNames} />;
}
