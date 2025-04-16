import { ChatMessages } from "@/restate/services/chatMessages";
import { CHAT_MESSAGES_OBJECT } from "@/restate/services/constants";
import * as restate from "@restatedev/restate-sdk-clients";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
// This is required to enable streaming
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const encoder = new TextEncoder();
const rs = restate.connect({
  url: "http://localhost:8080",
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __clientForTypeChecking = rs.objectClient<ChatMessages>(
  CHAT_MESSAGES_OBJECT,
  ""
);

function iteratorToStream(
  client: typeof __clientForTypeChecking,
  initialFrom: number
) {
  let from: number = initialFrom;
  return new ReadableStream({
    async start(controller) {
      const { messages, lastMessageIndex } = await client.getMessages(from);

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const fromQuery = Number(searchParams.get("from") || 0);
  const fromNumber = isNaN(fromQuery) ? 0 : fromQuery;

  const chatClient = rs.objectClient<ChatMessages>(CHAT_MESSAGES_OBJECT, id);
  const { signal } = request;
  const stream = iteratorToStream(chatClient, fromNumber);
  signal.addEventListener("abort", () => {
    console.log("Connection dropped while processing");
    stream.cancel();
  });
  return new Response(stream);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { content, sender } = await request.json();

  const chatClient = rs.objectClient<ChatMessages>(CHAT_MESSAGES_OBJECT, id);
  const response = await chatClient.send({
    content,
    sender,
  });
  return Response.json(response);
}
