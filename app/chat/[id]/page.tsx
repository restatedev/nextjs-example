"use client";
import { ChatMessage, ChatMessages } from "@/restate/services/chatMessages";
import { CHAT_MESSAGES_OBJECT } from "@/restate/services/constants";
import Form from "next/form";
import { useEffect, useState } from "react";
import * as restate from "@restatedev/restate-sdk-clients";
import { useParams } from "next/navigation";

export default function Chat() {
  const { id } = useParams<{ id: string }>();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [client] = useState(() => {
    const rs = restate.connect({ url: "http://localhost:8080" });

    return rs.objectClient<ChatMessages>(CHAT_MESSAGES_OBJECT, id);
  });

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();
    const obtainAPIResponse = async () => {
      const apiResponse = await fetch(`/api/chat/${id}/messages`, {
        signal: abortController.signal,
      });

      if (!apiResponse.body) return;

      const reader = apiResponse.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        if (value && !cancelled) {
          setMessages((messages) => [...messages, ...JSON.parse(value)]);
        }
      }
    };
    obtainAPIResponse();

    return () => {
      abortController.abort();
      cancelled = true;
    };
  }, [id]);

  const formAction = async (formData: FormData) => {
    if (String(formData.get("message"))) {
      await client.send({
        content: String(formData.get("message")),
        sender: "me",
      });
    }
  };

  console.log(messages);
  return (
    <div className="min-h-[100vh] max-w-xl w-full mx-auto flex flex-col ">
      <div className="flex-auto py-12 flex flex-col gap-2 items-start">
        {messages.map((message) => (
          <div
            key={message.timestamp}
            className="rounded-lg bg-white border border-gray-200 shadow-sm py-1 px-2"
          >
            {message.content}
          </div>
        ))}
      </div>
      <div className="sticky bottom-4 w-full rounded-lg bg-white outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
        <Form className="relative min-h-28" action={formAction}>
          <textarea
            name="message"
            aria-label="Write your message"
            placeholder="Write your message"
            className="absolute inset-0 block w-full resize-none bg-transparent px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <button className="absolute right-1.5 bottom-1.5 items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Send
          </button>
        </Form>
      </div>
    </div>
  );
}
