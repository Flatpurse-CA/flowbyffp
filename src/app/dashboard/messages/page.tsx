import { createClient } from "@/lib/supabase/server";
import { getShopContext } from "@/lib/dashboard/shop";
import { listConversations, listMessages, getOrCreateConversation } from "./actions";
import { MessagesClient } from "./MessagesClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function MessagesPage() {
  const ctx = await getShopContext();

  if (!ctx) {
    return (
      <div style={{ maxWidth: 460, margin: "100px auto 0", textAlign: "center" }}>
        <h1 style={{ color: "rgb(250,250,250)", fontSize: 19, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Finish setting up your shop
        </h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
          We couldn&apos;t find a shop linked to your account yet.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData.user?.id ?? "";

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
