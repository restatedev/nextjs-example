import { ChatMessages } from "@/restate/services/chatMessages";
import { CHAT_MESSAGES_OBJECT } from "@/restate/services/constants";
import * as restate from "@restatedev/restate-sdk-clients";

const encoder = new TextEncoder();

const rs = restate.connect({ url: "http://localhost:8080" });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __clientForTypeChecking = rs.objectClient<ChatMessages>(
  CHAT_MESSAGES_OBJECT,
  ""
);

function iteratorToStream(client: typeof __clientForTypeChecking) {
  let from: number;
  return new ReadableStream({
    async start(controller) {
      const { messages, lastMessageIndex } = await client.getMessages(-1);

      from = lastMessageIndex + 1;
      controller.enqueue(encoder.encode(JSON.stringify(messages)));
    },
    async pull(controller) {
      const { messages, lastMessageIndex } = await client.subscribe(from);

      from = lastMessageIndex + 1;
      controller.enqueue(encoder.encode(JSON.stringify(messages)));
    },
    async cancel() {
      console.log("Clean up");
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chatClient = rs.objectClient<ChatMessages>(CHAT_MESSAGES_OBJECT, id);
  const { signal } = request;
  const stream = iteratorToStream(chatClient);
  signal.addEventListener("abort", () => {
    console.log("Connection dropped while processing");
    stream.cancel();
  });
  return new Response(stream);
}
