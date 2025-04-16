import * as restate from "@restatedev/restate-sdk";
import {
  CHAT_SUBSCRIPTIONS_OBJECT,
  CHAT_MESSAGES_OBJECT,
  LAST_MESSAGE_INDEX,
} from "./constants";
import { ChatSubscription, chatSubscriptions } from "./chatSubscriptions";

export interface ChatMessage {
  sender: string;
  content: string;
  timestamp: number;
}

function getMessageStateKey(index: number) {
  return `message_${index}`;
}

export const chatMessages = restate.object({
  ...CHAT_MESSAGES_OBJECT,
  handlers: {
    send: restate.handlers.object.exclusive(
      async (ctx, { content, sender }: Omit<ChatMessage, "timestamp">) => {
        const lastMessageIndex =
          (await ctx.get<number>(LAST_MESSAGE_INDEX)) ?? -1;
        const nextMessageIndex = lastMessageIndex + 1;
        const timestamp = await ctx.date.now();

        await ctx.set<ChatMessage>(getMessageStateKey(nextMessageIndex), {
          content,
          sender,
          timestamp,
        });
        await ctx.set<number>(LAST_MESSAGE_INDEX, nextMessageIndex);
        ctx.objectSendClient(chatMessages, ctx.key).updateSubscribers();

        return {
          content,
          sender,
          timestamp,
        };
      }
    ),
    updateSubscribers: restate.handlers.object.shared(async (ctx) => {
      const subscriptionClient = ctx.objectClient<ChatSubscription>(
        CHAT_SUBSCRIPTIONS_OBJECT as ChatSubscription,
        ctx.key
      );

      const subscribers = await subscriptionClient.getSubscribers();

      for (const subscribe of subscribers) {
        await ctx.resolveAwakeable(
          subscribe.id,
          await ctx
            .objectClient(chatMessages, ctx.key)
            .getMessages(subscribe.lastMessageIndex)
        );
      }
      await subscriptionClient.clearSubscription(
        subscribers.map(({ id }) => id)
      );
    }),
    subscribe: restate.handlers.object.shared(async (ctx, from: number) => {
      const { id, promise } = ctx.awakeable<{
        messages: ChatMessage[];
        lastMessageIndex: number;
      }>();

      ctx
        .objectSendClient<ChatSubscription>(chatSubscriptions, ctx.key)
        .addSubscription({ id, lastMessageIndex: from });

      const payload = await promise;
      return payload;
    }),
    getMessages: restate.handlers.object.shared(
      async (ctx, from: number = 0) => {
        const lastMessageIndex =
          (await ctx.get<number>(LAST_MESSAGE_INDEX)) ?? -1;

        if (lastMessageIndex >= from) {
          const keys = Array.from(
            { length: lastMessageIndex - from + 1 },
            (_, i) => from + i
          ).map(getMessageStateKey);
          const messages = (
            await Promise.all(
              keys.map(async (key) => await ctx.get<ChatMessage>(key))
            )
          ).filter((m): m is ChatMessage => Boolean(m));

          return {
            messages,
            lastMessageIndex,
          };
        }

        return { messages: [], lastMessageIndex };
      }
    ),
  },
});

export type ChatMessages = typeof chatMessages;
