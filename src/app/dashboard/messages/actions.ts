"use server";

import { revalidatePath } from "next/cache";
import { requireShop, getShopContext } from "@/lib/dashboard/shop";

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

export async function getOrCreateConversation(staffId?: string): Promise<{ id: string } | null> {
  const ctx = await getShopContext();
  if (!ctx) return null;
  const { supabase, shopId } = await requireShop();

  const targetStaffId = ctx.role === "owner" ? staffId : ctx.staffId;
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
  if (!ctx || ctx.role !== "owner") return [];

  const { supabase, shopId } = await requireShop();
  const { data: userData } = await supabase.auth.getUser();
  const myId = userData.user?.id;

  const { data: staffRows } = await supabase
    .from("staff")
    .select("id, full_name, color")
    .eq("shop_id", shopId)
    .eq("active", true)
    .order("full_name");

  if (!staffRows || staffRows.length === 0) return [];

  const { data: convRows } = await supabase.from("conversations").select("id, staff_id").eq("shop_id", shopId);
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

  const convByStaff = new Map(convs.map(c => [c.staff_id as string, c.id as string]));

  return staffRows.map(s => {
    const convId = convByStaff.get(s.id as string);
    const msgs = convId ? byConv.get(convId) ?? [] : [];
    const last = msgs[msgs.length - 1];
    return {
      id: convId ?? "",
      staffId: s.id as string,
      staffName: s.full_name as string,
      staffColor: s.color as string,
      lastMessage: last?.body ?? null,
      lastMessageAt: last?.created_at ?? null,
      unreadCount: convId ? unreadByConv.get(convId) ?? 0 : 0,
    };
  });
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
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");
  if (!body.trim()) throw new Error("Message can't be empty");

  const { error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: userData.user.id, body: body.trim() });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/messages");
}

export async function markConversationRead(conversationId: string) {
  const { supabase } = await requireShop();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userData.user.id)
    .is("read_at", null);

  revalidatePath("/dashboard/messages");
}

export async function getUnreadCount(): Promise<number> {
  const ctx = await getShopContext();
  if (!ctx) return 0;

  const { supabase } = await requireShop();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return 0;

  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .neq("sender_id", userData.user.id)
    .is("read_at", null);

  return count ?? 0;
}
