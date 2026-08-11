import Anthropic from "@anthropic-ai/sdk";

export type FrontdeskIntent = "book" | "reschedule" | "cancel" | "price" | "question" | "complaint";

export type FrontdeskAiResult = { intent: FrontdeskIntent; reply: string | null; escalate: boolean };

let client: Anthropic | null = null;
function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
  if (!client) client = new Anthropic({ apiKey });
  return client;
}

const RESPOND_TOOL: Anthropic.Tool = {
  name: "respond",
  description: "Send the classified intent and reply back to the client conversation.",
  input_schema: {
    type: "object",
    properties: {
      intent: { type: "string", enum: ["book", "reschedule", "cancel", "price", "question", "complaint"] },
      escalate: {
        type: "boolean",
        description: "true if this needs a human: complaints, refund requests, anything not confidently answerable from the given shop info",
      },
      reply: {
        type: ["string", "null"],
        description: "The SMS/email reply to send the client. Null when escalate is true (a human will respond instead).",
      },
    },
    required: ["intent", "escalate", "reply"],
  },
};

// AI reply generation for the AI Front Desk flow. Deliberately constrained:
// the model only ever gets the shop's real service list + real booking/account
// URLs as context, is instructed never to invent a price or claim a booking
// was made (bookings always go through the real booking page, never through
// a chat message), and defaults to escalate=true on anything it isn't
// confident about — same "ambiguous → human" philosophy as the original
// keyword-heuristic version this replaces, just with real language
// understanding instead of substring matching.
export async function generateFrontdeskReply(input: {
  shopName: string;
  services: { name: string; price: number }[];
  bookingUrl: string;
  accountUrl: string;
  customerMessage: string;
  history: { direction: "inbound" | "outbound"; body: string }[];
  channel: "sms" | "email";
}): Promise<FrontdeskAiResult> {
  const serviceList = input.services.length > 0
    ? input.services.map(s => `- ${s.name}: C$${s.price}`).join("\n")
    : "(no services on file yet)";

  const maxLen = input.channel === "sms" ? "under 300 characters (this is an SMS reply)" : "under 600 characters";

  const system = `You are the AI front desk for ${input.shopName}, a salon booking on the Flow platform. You are texting/emailing directly with a client.

Real facts you may use (never invent anything beyond this):
Services and prices:
${serviceList}

Booking link (always share this instead of claiming to book something yourself): ${input.bookingUrl}
Account/cancellation link: ${input.accountUrl}

Rules:
- Never invent a service, price, or availability that isn't listed above.
- Never claim you booked, rescheduled, or cancelled anything: always point to the real link so the client confirms it themselves against live availability.
- Keep the reply warm, brief, and ${maxLen}.
- If the message is a complaint, refund request, dispute, or anything else you are not confident you can answer correctly from the facts above, set escalate=true and reply=null. A human will take over the conversation.
- Otherwise set escalate=false and write the reply.
- Always call the "respond" tool with your answer, never reply in plain text.`;

  const messages: Anthropic.MessageParam[] = [
    ...input.history.slice(-6).map((m): Anthropic.MessageParam => ({
      role: m.direction === "inbound" ? "user" : "assistant",
      content: m.body,
    })),
    { role: "user", content: input.customerMessage },
  ];

  try {
    const response = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system,
      messages,
      tools: [RESPOND_TOOL],
      tool_choice: { type: "tool", name: "respond" },
    });

    const toolUse = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    if (!toolUse) return { intent: "complaint", reply: null, escalate: true };

    const parsed = toolUse.input as { intent: FrontdeskIntent; escalate: boolean; reply: string | null };
    if (parsed.escalate || !parsed.reply) return { intent: parsed.intent, reply: null, escalate: true };
    return { intent: parsed.intent, reply: parsed.reply, escalate: false };
  } catch {
    // AI call failed outright (bad key, rate limit, network) — fail safe to
    // escalation rather than silently going quiet or replying with garbage.
    return { intent: "complaint", reply: null, escalate: true };
  }
}
