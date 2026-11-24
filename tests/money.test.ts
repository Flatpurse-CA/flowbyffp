import { describe, expect, it, vi } from "vitest";
import { amountFor, insideWindow, policyText, type Policy } from "@/lib/booking/policy";
import { fsaOf, inServiceArea, validPostal } from "@/lib/booking/mobile";
import { computeTax } from "@/lib/tax";

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({}) }));

describe("booking policy fees", () => {
  it("fixed fee never exceeds the price", () => expect(amountFor("fixed", 50, 30)).toBe(30));
  it("percent fee rounds up to the cent", () => expect(amountFor("percent", 20, 33.33)).toBe(6.67));
  it("none is free", () => expect(amountFor("none", 99, 100)).toBe(0));
  it("window check", () => {
    expect(insideWindow(new Date(Date.now() + 3_600_000).toISOString(), 24)).toBe(true);
    expect(insideWindow(new Date(Date.now() + 48 * 3_600_000).toISOString(), 24)).toBe(false);
  });
  it("policy text names the fees", () => {
    const p: Policy = { deposit_mode: "percent", deposit_value: 20, cancel_window_hours: 24, late_cancel_fee_mode: "percent", late_cancel_fee_value: 50, no_show_fee_mode: "fixed", no_show_fee_value: 40 };
    const t = policyText(p, 100);
    expect(t).toContain("24 hours");
    expect(t).toContain("$50.00");
    expect(t).toContain("$40.00");
  });
});

describe("mobile service area", () => {
  it("parses FSA", () => expect(fsaOf("t2p 1j9")).toBe("T2P"));
  it("validates postal codes", () => { expect(validPostal("T2P 1J9")).toBe(true); expect(validPostal("12345")).toBe(false); });
  it("matches prefixes", () => {
    expect(inServiceArea("T2P1J9", ["T2"])).toBe(true);
    expect(inServiceArea("T3A0A1", ["T2P", "T2R"])).toBe(false);
    expect(inServiceArea("T3A0A1", [])).toBe(true);
  });
});

describe("platform fee", () => {
  it("is off unless enabled", async () => {
    delete process.env.PLATFORM_FEE_ENABLED;
    const { feeForPlan } = await import("@/lib/billing/platformFee");
    expect(feeForPlan("starter", 10000)).toBeUndefined();
  });
  it("uses plan rates", async () => {
    process.env.PLATFORM_FEE_ENABLED = "true";
    const { feeForPlan } = await import("@/lib/billing/platformFee");
    expect(feeForPlan("starter", 10000)).toBe(60);
    expect(feeForPlan("starter", 4500, "in_person")).toBe(36);
    expect(feeForPlan("pro", 10000)).toBe(50);
    expect(feeForPlan("pro", 4500, "in_person")).toBe(27);
    delete process.env.PLATFORM_FEE_ENABLED;
  });
});

describe("tax engine", () => {
  it("unregistered shops charge no tax", () => {
    expect(computeTax({ provinceCode: "AB", registered: false, pstOnServices: false, inclusive: false }, [{ amount: 100, kind: "service" }]).tax).toBe(0);
  });
  it("Alberta GST is 5%", () => {
    expect(computeTax({ provinceCode: "AB", registered: true, pstOnServices: false, inclusive: false }, [{ amount: 100, kind: "service" }]).tax).toBe(5);
  });
  it("Ontario HST is 13%", () => {
    expect(computeTax({ provinceCode: "ON", registered: true, pstOnServices: false, inclusive: false }, [{ amount: 100, kind: "service" }]).tax).toBe(13);
  });
});
