"use server";

import { revalidatePath } from "next/cache";
import { requireShop, getShopContext } from "@/lib/dashboard/shop";
import { stripe } from "@/lib/stripe";
import { getRequestOrigin } from "@/lib/requestOrigin";
import { getPlan, getStripePriceId, type BillingInterval } from "@/lib/plans";

export type BusinessHourRow = { weekday: number; open: boolean; start: string; end: string };

export async function getStripeStatus(): Promise<{ connected: boolean }> {
  const ctx = await getShopContext();
  if (!ctx) return { connected: false };
  const { supabase, shopId } = await requireShop();
  const { data } = await supabase.from("shops").select("stripe_connected").eq("id", shopId).maybeSingle();
  return { connected: Boolean(data?.stripe_connected) };
}

export async function startStripeOnboarding(): Promise<{ url?: string; error?: string }> {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return { error: "Only the shop owner can connect Stripe" };
  const { supabase, shopId } = await requireShop();

  const { data: shop } = await supabase.from("shops").select("stripe_account_id, name").eq("id", shopId).maybeSingle();
  if (!shop) return { error: "Shop not found" };

  const origin = await getRequestOrigin();
  let accountId = shop.stripe_account_id as string | null;

  try {
    if (!accountId) {
      const account = await stripe().accounts.create({
        type: "express",
        business_profile: { name: shop.name as string },
      });
      accountId = account.id;
      await supabase.from("shops").update({ stripe_account_id: accountId }).eq("id", shopId);
    }

    const accountLink = await stripe().accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard/settings/stripe-return?refresh=1`,
      return_url: `${origin}/dashboard/settings/stripe-return`,
      type: "account_onboarding",
    });

    return { url: accountLink.url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't start Stripe onboarding" };
  }
}

export type BillingStatus = {
  plan: string;
  subscriptionStatus: string | null;
  billingInterval: BillingInterval | null;
  isFounder: boolean;
  foundersEligible: boolean;
  foundersSpotsRemaining: number;
};

export async function getBillingStatus(): Promise<BillingStatus | null> {
  const ctx = await getShopContext();
  if (!ctx) return null;
  const { supabase, shopId } = await requireShop();

  const [{ data: shop }, { data: founders }] = await Promise.all([
    supabase.from("shops").select("plan, subscription_status, billing_interval, is_founder, founder_discount_claimed_at").eq("id", shopId).maybeSingle(),
    supabase.from("founders_program").select("spots_remaining").eq("id", true).maybeSingle(),
  ]);

  const spotsRemaining = founders?.spots_remaining ?? 0;
  return {
    plan: (shop?.plan as string) ?? "starter",
    subscriptionStatus: (shop?.subscription_status as string | null) ?? null,
    billingInterval: (shop?.billing_interval as BillingInterval | null) ?? null,
    isFounder: Boolean(shop?.is_founder),
    foundersEligible: !shop?.founder_discount_claimed_at && spotsRemaining > 0,
    foundersSpotsRemaining: spotsRemaining,
  };
}

/**
 * Starts Stripe Checkout for Pro/Pro+. Starter needs no payment (handled by
 * just writing shops.plan directly); Enterprise is sales-negotiated, not
 * self-serve. `claimFounders` shows the 40%-off coupon on the Checkout page
 * itself so the customer sees the real price they're agreeing to — the spot is
 * only actually decremented once the webhook sees payment succeed.
 */
export async function startCheckout(input: { planKey: "pro" | "pro_plus"; interval: BillingInterval; claimFounders: boolean }): Promise<{ url?: string; error?: string }> {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return { error: "Only the shop owner can manage billing" };
  const { supabase, shopId } = await requireShop();

  const { data: shop } = await supabase
    .from("shops")
    .select("stripe_customer_id, name, founder_discount_claimed_at")
    .eq("id", shopId)
    .maybeSingle();
  if (!shop) return { error: "Shop not found" };

  const plan = getPlan(input.planKey);
  const origin = await getRequestOrigin();

  try {
    let customerId = shop.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe().customers.create({ name: shop.name as string, metadata: { shop_id: shopId } });
      customerId = customer.id;
      await supabase.from("shops").update({ stripe_customer_id: customerId }).eq("id", shopId);
    }

    const wantsFounders = input.claimFounders && !shop.founder_discount_claimed_at;
    let foundersSpotsLeft = 0;
    if (wantsFounders) {
      const { data } = await supabase.from("founders_program").select("spots_remaining").eq("id", true).maybeSingle();
      foundersSpotsLeft = data?.spots_remaining ?? 0;
    }
    const applyFoundersDiscount = wantsFounders && foundersSpotsLeft > 0;

    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: getStripePriceId(input.planKey, input.interval), quantity: 1 }],
      discounts: applyFoundersDiscount ? [{ coupon: "founders-40-off" }] : undefined,
      allow_promotion_codes: !applyFoundersDiscount,
      success_url: `${origin}/dashboard/settings?tab=Billing&checkout=success`,
      cancel_url: `${origin}/dashboard/settings?tab=Billing&checkout=cancelled`,
      metadata: {
        context: "platform_subscription",
        shop_id: shopId,
        plan_key: plan.key,
        interval: input.interval,
        founder_claim: applyFoundersDiscount ? "true" : "false",
      },
    });

    return { url: session.url ?? undefined };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't start checkout" };
  }
}

/** Starter has no Stripe subscription — just record the plan directly. Downgrading off a paid plan should go through openBillingPortal (cancel) instead, so subscription_status stays truthful. */
export async function chooseStarterPlan(): Promise<{ error?: string }> {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return { error: "Only the shop owner can change plans" };
  const { supabase, shopId } = await requireShop();

  const { error } = await supabase.from("shops").update({ plan: "starter" }).eq("id", shopId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return {};
}

export async function openBillingPortal(): Promise<{ url?: string; error?: string }> {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return { error: "Only the shop owner can manage billing" };
  const { supabase, shopId } = await requireShop();

  const { data: shop } = await supabase
    .from("shops")
    .select("stripe_customer_id, subscription_status, plan, billing_interval")
    .eq("id", shopId)
    .maybeSingle();
  if (!shop) return { error: "Shop not found" };

  // A shop can be nominally "on" a paid plan (chosen at signup) without ever
  // having completed Checkout, so there's no active subscription for the
  // portal to manage yet. Rather than dead-ending with an error, start real
  // Checkout for that plan — this is the actual "add a card" path.
  if (!shop.stripe_customer_id || shop.subscription_status !== "active") {
    const planKey = shop.plan === "pro_plus" ? "pro_plus" : "pro";
    return startCheckout({
      planKey,
      interval: (shop.billing_interval as BillingInterval | null) ?? "monthly",
      claimFounders: false,
    });
  }

  const origin = await getRequestOrigin();
  try {
    const session = await stripe().billingPortal.sessions.create({
      customer: shop.stripe_customer_id as string,
      return_url: `${origin}/dashboard/settings?tab=Billing`,
    });
    return { url: session.url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't open billing portal" };
  }
}

export type FlowKey = "rebooking" | "noshow" | "winback" | "birthday" | "lastminute" | "frontdesk";

const FLOW_COLUMN: Record<FlowKey, string> = {
  rebooking:  "reminders_enabled",
  noshow:     "noshow_recovery_enabled",
  winback:    "winback_enabled",
  birthday:   "birthday_enabled",
  lastminute: "filler_enabled",
  frontdesk:  "frontdesk_enabled",
};

export async function setFlowEnabled(flow: FlowKey, enabled: boolean): Promise<{ error?: string }> {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return { error: "Only the shop owner can change AutoPilot flows" };
  const { supabase, shopId } = await requireShop();

  const column = FLOW_COLUMN[flow];
  const { error } = await supabase.from("shops").update({ [column]: enabled }).eq("id", shopId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/autopilot");
  return {};
}

export type NotificationPrefs = {
  new_booking: boolean;
  cancellation: boolean;
  no_show_alert: boolean;
  payment_received: boolean;
  autopilot_win: boolean;
  daily_brief: boolean;
  weekly_revenue_recap: boolean;
  monthly_statement: boolean;
};

export async function updateNotificationPrefs(prefs: NotificationPrefs): Promise<{ error?: string }> {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return { error: "Only the shop owner can change notification settings" };
  const { supabase, shopId } = await requireShop();

  const { error } = await supabase.from("shops").update({ notification_prefs: prefs }).eq("id", shopId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return {};
}

export async function updateTaxSettings(input: { taxRate: number | null; taxInclusive: boolean }): Promise<{ error?: string }> {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return { error: "Only the shop owner can change tax settings" };
  const { supabase, shopId } = await requireShop();

  const { error } = await supabase.from("shops").update({ tax_rate: input.taxRate, tax_inclusive: input.taxInclusive }).eq("id", shopId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return {};
}

export async function getBusinessHours(): Promise<BusinessHourRow[]> {
  const ctx = await getShopContext();
  if (!ctx) return [];
  const { supabase, shopId } = await requireShop();

  const { data } = await supabase
    .from("business_hours")
    .select("weekday, open, start_time, end_time")
    .eq("shop_id", shopId)
    .order("weekday", { ascending: true });

  return (data ?? []).map(r => ({
    weekday: r.weekday as number,
    open: Boolean(r.open),
    start: String(r.start_time).slice(0, 5),
    end: String(r.end_time).slice(0, 5),
  }));
}

export async function updateBusinessHours(rows: BusinessHourRow[]) {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") throw new Error("Only the shop owner can change business hours");
  const { supabase, shopId } = await requireShop();

  const { error } = await supabase
    .from("business_hours")
    .upsert(
      rows.map(r => ({ shop_id: shopId, weekday: r.weekday, open: r.open, start_time: r.start, end_time: r.end })),
      { onConflict: "shop_id,weekday" },
    );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/settings");
}


export type BusinessProfile = {
  name: string;
  handle: string;
  businessType: string;
  bio: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
};

// Route segments under src/app/ that a shop handle can't collide with,
// since /book/[handle] would otherwise be ambiguous with a real route.
const RESERVED_HANDLES = new Set([
  "admin", "api", "auth", "book", "cookie-policy", "customer", "dashboard",
  "forgot-password", "home-main", "login", "main", "onboarding", "privacy",
  "refund-policy", "reset-password", "signup", "staff", "terms", "waitlist", "waitlist2",
]);

export async function updateBusinessProfile(input: BusinessProfile): Promise<{ error?: string; handle?: string }> {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return { error: "Only the shop owner can edit the business profile" };
  const { supabase, shopId } = await requireShop();

  const name = input.name.trim();
  if (!name) return { error: "Business name can't be empty" };

  const handle = input.handle.trim().toLowerCase();
  if (!/^[a-z0-9-]{3,40}$/.test(handle)) {
    return { error: "Booking link can only contain lowercase letters, numbers, and hyphens (3-40 characters)" };
  }
  if (RESERVED_HANDLES.has(handle)) {
    return { error: `"${handle}" is a reserved word and can't be used as a booking link` };
  }

  const { data: current } = await supabase.from("shops").select("handle").eq("id", shopId).maybeSingle();
  const previousHandle = current?.handle as string | null;

  if (handle !== previousHandle) {
    const { data: taken } = await supabase.from("shops").select("id").eq("handle", handle).neq("id", shopId).maybeSingle();
    if (taken) return { error: "That booking link is already taken by another shop" };
  }

  const { error } = await supabase
    .from("shops")
    .update({
      name,
      handle,
      business_type: input.businessType.trim(),
      bio: input.bio.trim(),
      city: input.city.trim(),
      province: input.province.trim(),
      postal_code: input.postalCode.trim(),
      phone: input.phone.trim(),
    })
    .eq("id", shopId);

  if (error) return { error: error.message };

  // Keep the old link alive as a redirect — best-effort: a stale handle
  // history row shouldn't block the actual profile save above.
  if (previousHandle && handle !== previousHandle) {
    await supabase.from("shop_handle_history").upsert({ old_handle: previousHandle, shop_id: shopId }, { onConflict: "old_handle" });
  }

  revalidatePath("/dashboard/settings");
  revalidatePath(`/book/${handle}`);
  return { handle };
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// The file itself is uploaded here (not client-direct-to-storage) so type and
// size are actually enforced — a client-side-only check can be bypassed by
// anyone who skips the browser. Uses the session-bound client (not the admin
// client), so bucket "shop-assets" RLS (0033_shop_images.sql) still applies.
export async function updateShopImage(formData: FormData): Promise<{ error?: string; url?: string }> {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return { error: "Only the shop owner can change photos" };
  const { supabase, shopId } = await requireShop();

  const kind = formData.get("kind") as "profile" | "cover" | null;
  const file = formData.get("file") as File | null;
  if (kind !== "profile" && kind !== "cover") return { error: "Invalid image kind" };
  if (!file || file.size === 0) return { error: "No file provided" };
  if (!file.type.startsWith("image/")) return { error: "Please choose an image file" };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Image must be under 5MB" };

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${shopId}/${kind}-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("shop-assets").upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) return { error: uploadError.message };

  const { data: publicUrlData } = supabase.storage.from("shop-assets").getPublicUrl(path);
  const url = publicUrlData.publicUrl;

  const column = kind === "profile" ? "profile_image_url" : "cover_image_url";
  const { data: shop } = await supabase.from("shops").select("handle").eq("id", shopId).maybeSingle();
  const { error } = await supabase.from("shops").update({ [column]: url }).eq("id", shopId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  if (shop?.handle) revalidatePath(`/book/${shop.handle}`);
  return { url };
}
