import type { JobHandler } from "@/lib/scheduler";
import { sendShopSms } from "@/lib/sms/allowance";

/** Job handlers for the scheduler (FL-004). Add a kind here to schedule new work. */
export const JOB_HANDLERS: Record<string, JobHandler> = {
  // An automated text held back by quiet hours, now inside the 8am-9pm window.
  "sms.send": async (p) => {
    const r = await sendShopSms(String(p.shopId), String(p.to), String(p.body), { marketing: Boolean(p.marketing), kind: (p.kind as string | null) ?? undefined });
    if (r.error && !r.overAllowance) throw new Error(r.error);
  },
};
