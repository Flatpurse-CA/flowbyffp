"use server";

import { revalidatePath } from "next/cache";
import { requireShop, getShopContext, getAuthUser } from "@/lib/dashboard/shop";
import { TEAM_CHANNEL_KEY, OWNER_THREAD_KEY } from "./constants";

export type ConversationSummary = {
  id: string;
  staffId: string;
  staffName: string;
  staffColor: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type MessageRow = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

export async function getOrCreateTeamChannel(): Promise<{ id: string } | null> {
  const ctx = await getShopContext();
  if (!ctx) return null;
  const { supabase, shopId } = await requireShop();

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("shop_id", shopId)
    .eq("kind", "team_channel")
    .maybeSingle();

  if (existing) return { id: existing.id as string };

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ shop_id: shopId, kind: "team_channel", staff_id: null })
    .select("id")
    .single();

  if (error || !created) throw new Error(error?.message ?? "Couldn't start the team channel");
  return { id: created.id as string };
}

export async function getOrCreateConversation(staffId?: string): Promise<{ id: string } | null> {
  const ctx = await getShopContext();
  if (!ctx) return null;
  if (staffId === TEAM_CHANNEL_KEY) return getOrCreateTeamChannel();

  const { supabase, shopId } = await requireShop();

  const resolvedStaffId = staffId === OWNER_THREAD_KEY ? undefined : staffId;
  const targetStaffId = ctx.role === "owner" ? resolvedStaffId : ctx.staffId;
  if (!targetStaffId) {
    if (ctx.role === "owner") throw new Error("staffId is required");
    return null;
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("shop_id", shopId)
    .eq("staff_id", targetStaffId)
    .maybeSingle();

  if (existing) return { id: existing.id as string };

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ shop_id: shopId, staff_id: targetStaffId })
    .select("id")
    .single();

  if (error || !created) throw new Error(error?.message ?? "Couldn't start conversation");
  return { id: created.id as string };
}

export async function listConversations(): Promise<ConversationSummary[]> {
  const ctx = await getShopContext();
  if (!ctx) return [];

  const { supabase, shopId } = await requireShop();
  const user = await getAuthUser();
  const myId = user?.id;

  // Every conversation this shop has — includes the team channel (staff_id
  // null, kind team_channel) alongside each owner<->staff 1:1 thread.
  const { data: convRows } = await supabase.from("conversations").select("id, staff_id, kind").eq("shop_id", shopId);
  const convs = convRows ?? [];
  const convIds = convs.map(c => c.id as string);

  const { data: msgRows } = convIds.length > 0
    ? await supabase
        .from("messages")
        .select("conversation_id, body, sender_id, created_at, read_at")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: true })
    : { data: [] as { conversation_id: string; body: string; sender_id: string; created_at: string; read_at: string | null }[] };

  const byConv = new Map<string, { body: string; created_at: string }[]>();
  const unreadByConv = new Map<string, number>();
  for (const m of msgRows ?? []) {
    const cid = m.conversation_id as string;
    if (!byConv.has(cid)) byConv.set(cid, []);
    byConv.get(cid)!.push({ body: m.body as string, created_at: m.created_at as string });
    if (m.sender_id !== myId && !m.read_at) unreadByConv.set(cid, (unreadByConv.get(cid) ?? 0) + 1);
  }

  const rowFor = (convId: string | undefined, key: string, name: string, color: string): ConversationSummary => {
    const msgs = convId ? byConv.get(convId) ?? [] : [];
    const last = msgs[msgs.length - 1];
    return {
      id: convId ?? "",
      staffId: key,
      staffName: name,
      staffColor: color,
      lastMessage: last?.body ?? null,
      lastMessageAt: last?.created_at ?? null,
      unreadCount: convId ? unreadByConv.get(convId) ?? 0 : 0,
    };
  };

  const teamConvId = convs.find(c => c.kind === "team_channel")?.id as string | undefined;
  const teamRow = rowFor(teamConvId, TEAM_CHANNEL_KEY, "Team channel", "rgb(139,92,246)");

  if (ctx.role === "owner") {
    const { data: staffRows } = await supabase
      .from("staff")
      .select("id, full_name, color")
      .eq("shop_id", shopId)
      .eq("active", true)
      .order("full_name");

    const convByStaff = new Map(convs.filter(c => c.kind !== "team_channel").map(c => [c.staff_id as string, c.id as string]));
    const staffRowsOut = (staffRows ?? []).map(s => rowFor(convByStaff.get(s.id as string), s.id as string, s.full_name as string, s.color as string));

    return [teamRow, ...staffRowsOut];
  }

  // Staff: their own 1:1 with the owner, plus the shared team channel.
  const ownerConvId = convs.find(c => c.staff_id === ctx.staffId && c.kind !== "team_channel")?.id as string | undefined;
  const ownerRow = rowFor(ownerConvId, OWNER_THREAD_KEY, "Shop owner", "rgb(96,165,250)");

  return [ownerRow, teamRow];
}

export async function listMessages(conversationId: string): Promise<MessageRow[]> {
  const { supabase } = await requireShop();
  const { data, error } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, body, created_at, read_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data ?? []).map(m => ({
    id: m.id as string,
    conversationId: m.conversation_id as string,
    senderId: m.sender_id as string,
    body: m.body as string,
    createdAt: m.created_at as string,
    readAt: m.read_at as string | null,
  }));
}

export async function sendMessage(conversationId: string, body: string) {
  const { supabase } = await requireShop();
  const user = await getAuthUser();
  if (!user) throw new Error("Not authenticated");
  if (!body.trim()) throw new Error("Message can't be empty");

  const { error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, body: body.trim() });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/messages");
}

export async function markConversationRead(conversationId: string) {
  const { supabase } = await requireShop();
  const user = await getAuthUser();
  if (!user) return;

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .is("read_at", null);

  revalidatePath("/dashboard/messages");
}

export async function getUnreadCount(): Promise<number> {
  const ctx = await getShopContext();
  if (!ctx) return 0;

  const { supabase } = await requireShop();
  const user = await getAuthUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .neq("sender_id", user.id)
    .is("read_at", null);

  return count ?? 0;
}
