import { getShopContext, getAuthUser } from "@/lib/dashboard/shop";
import { listConversations, listMessages, getOrCreateConversation } from "./actions";
import { MessagesClient } from "./MessagesClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function MessagesPage() {
  const ctx = await getShopContext();

  if (!ctx) {
    return (
      <div style={{ maxWidth: 460, margin: "100px auto 0", textAlign: "center" }}>
        <h1 style={{ color: "var(--dtext2)", fontSize: 19, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Finish setting up your shop
        </h1>
        <p style={{ color: "var(--dw45)", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
          We couldn&apos;t find a shop linked to your account yet.
        </p>
      </div>
    );
  }

  const user = await getAuthUser();
  const currentUserId = user?.id ?? "";

  if (ctx.role === "owner") {
    const conversations = await listConversations();
    return (
      <MessagesClient
        role="owner"
        conversations={conversations}
        initialConversationId={null}
        initialMessages={[]}
        currentUserId={currentUserId}
      />
    );
  }

  const conversation = await getOrCreateConversation();
  const messages = conversation ? await listMessages(conversation.id) : [];

  return (
    <MessagesClient
      role="staff"
      conversations={[]}
      initialConversationId={conversation?.id ?? null}
      initialMessages={messages}
      currentUserId={currentUserId}
    />
  );
}
