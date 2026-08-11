import { getAutopilotState } from "../autopilot/actions";
import { getDailyBriefData } from "../daily-brief/actions";
import { NotificationsClient } from "./NotificationsClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function NotificationsPage() {
  const [autopilot, brief] = await Promise.all([
    getAutopilotState(),
    getDailyBriefData(),
  ]);

  return <NotificationsClient events={autopilot.events} needsYou={brief.needsYou} />;
}
