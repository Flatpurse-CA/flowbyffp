"use client";

import { useEffect, useRef, useState } from "react";
import { Send, MessageSquare, ChevronLeft } from "lucide-react";
import type { ConversationSummary, MessageRow } from "./actions";
import { getOrCreateConversation, listMessages, sendMessage, markConversationRead } from "./actions";

function initialsFor(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() ?? "").slice(0, 2).join("") || "?";
}
function timeLabel(iso: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}
function dayLabel(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" }).format(new Date(iso));
}

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
};

const POLL_MS = 8000;

export function MessagesClient({ role, conversations, initialConversationId, initialMessages, currentUserId }: {
  role: "owner" | "staff";
  conversations: ConversationSummary[];
  initialConversationId: string | null;
  initialMessages: MessageRow[];
  currentUserId: string;
}) {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(
    role === "owner" ? conversations[0]?.staffId ?? null : null,
  );
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selected = role === "owner" ? conversations.find(c => c.staffId === selectedStaffId) ?? null : null;

  useEffect(() => {
    if (role !== "owner" || !selectedStaffId) return;
    let cancelled = false;
    (async () => {
      setLoadingThread(true);
      setMessages([]);
      const conv = await getOrCreateConversation(selectedStaffId);
      if (cancelled || !conv) { setLoadingThread(false); return; }
      setConversationId(conv.id);
      const msgs = await listMessages(conv.id);
      if (cancelled) return;
      setMessages(msgs);
      setLoadingThread(false);
      await markConversationRead(conv.id);
    })();
    return () => { cancelled = true; };
  }, [role, selectedStaffId]);

  useEffect(() => {
    if (!conversationId) return;
    markConversationRead(conversationId);
    const interval = setInterval(async () => {
      const msgs = await listMessages(conversationId);
      setMessages(msgs);
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!draft.trim() || !conversationId || sending) return;
    setSending(true);
    const body = draft.trim();
    setDraft("");
    try {
      await sendMessage(conversationId, body);
      const msgs = await listMessages(conversationId);
      setMessages(msgs);
    } finally {
      setSending(false);
    }
  };

  const thread = (
    <div className={selectedStaffId ? "messages-thread-panel messages-thread-active" : "messages-thread-panel"} style={{ ...card, flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      {(role === "staff" || selected) && (
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
          {role === "owner" && selected && (
            <button className="messages-back-btn" onClick={() => setSelectedStaffId(null)} style={{ display: "none", background: "none", border: "none", padding: 0, cursor: "pointer", color: "rgba(255,255,255,0.5)", flexShrink: 0 }}>
              <ChevronLeft size={20} />
            </button>
          )}
          {role === "owner" && selected && (
            <div style={{
              width: 34, height: 34, borderRadius: 10, background: `${selected.staffColor}22`, border: `1.5px solid ${selected.staffColor}44`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: selected.staffColor, flexShrink: 0,
            }}>
              {initialsFor(selected.staffName)}
            </div>
          )}
          <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: 0 }}>
            {role === "owner" ? selected?.staffName : "Your shop owner"}
          </p>
        </div>
      )}

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
        {loadingThread ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", margin: "auto" }}>Loading…</p>
        ) : messages.length === 0 ? (
          <div style={{ margin: "auto", textAlign: "center" }}>
            <MessageSquare size={24} color="rgba(255,255,255,0.15)" style={{ marginBottom: 10 }} />
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>No messages yet. Say hello.</p>
          </div>
        ) : messages.map((m, i) => {
          const mine = m.senderId === currentUserId;
          const prev = messages[i - 1];
          const showDay = !prev || dayLabel(prev.createdAt) !== dayLabel(m.createdAt);
          return (
            <div key={m.id}>
              {showDay && (
                <p style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 11, margin: "8px 0" }}>{dayLabel(m.createdAt)}</p>
              )}
              <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "70%", padding: "9px 13px", borderRadius: mine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: mine ? "rgb(109,40,217)" : "rgba(255,255,255,0.06)",
                  color: mine ? "white" : "rgba(255,255,255,0.85)",
                  fontSize: 13.5, lineHeight: 1.5,
                }}>
                  {m.body}
                  <div style={{ fontSize: 10, marginTop: 4, opacity: 0.6, textAlign: "right" }}>{timeLabel(m.createdAt)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 10 }}>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={conversationId ? "Type a message…" : "Select a conversation"}
          disabled={!conversationId}
          style={{
            flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "10px 14px", color: "rgb(250,250,250)", fontSize: 13.5, outline: "none",
          }}
        />
        <button onClick={handleSend} disabled={!draft.trim() || !conversationId || sending} style={{
          width: 40, height: 40, borderRadius: 10, border: "none",
          background: "rgb(109,40,217)", color: "white", display: "flex", alignItems: "center", justifyContent: "center",
          cursor: draft.trim() ? "pointer" : "default", opacity: draft.trim() ? 1 : 0.5, flexShrink: 0,
        }}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );

  if (role === "staff") {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", height: "calc(100vh - 160px)", display: "flex", flexDirection: "column" }}>
        <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.03em" }}>Messages</h1>
        {thread}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", height: "calc(100vh - 160px)", display: "flex", flexDirection: "column" }}>
      <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.03em" }}>Messages</h1>

      {conversations.length === 0 ? (
        <div style={{ ...card, flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", maxWidth: 320 }}>
            <MessageSquare size={24} color="rgba(255,255,255,0.15)" style={{ marginBottom: 10 }} />
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>
              Invite a team member from the Team page to start messaging with them.
            </p>
          </div>
        </div>
      ) : (
        <div className="messages-split" style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
          <div className={selectedStaffId ? "messages-list-panel messages-list-inactive" : "messages-list-panel"} style={{ ...card, width: 280, flexShrink: 0, overflowY: "auto", padding: 8 }}>
            {conversations.map(c => (
              <button
                key={c.staffId}
                onClick={() => setSelectedStaffId(c.staffId)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 10px",
                  borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
                  background: selectedStaffId === c.staffId ? "rgba(109,40,217,0.18)" : "transparent",
                  marginBottom: 2,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: `${c.staffColor}22`, border: `1.5px solid ${c.staffColor}44`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: c.staffColor, flexShrink: 0,
                }}>
                  {initialsFor(c.staffName)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>{c.staffName}</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11.5, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.lastMessage ?? "No messages yet"}
                  </p>
                </div>
                {c.unreadCount > 0 && (
                  <span style={{
                    minWidth: 18, height: 18, borderRadius: 9, background: "rgb(139,92,246)", color: "white",
                    fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", flexShrink: 0,
                  }}>
                    {c.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          {thread}
        </div>
      )}
    </div>
  );
}
