import * as restate from "@restatedev/restate-sdk";
import { CHAT_SUBSCRIPTIONS_OBJECT, SUBSCRIBERS_STATE_NAME } from "./constants";

export const chatSubscriptions = restate.object({
  ...CHAT_SUBSCRIPTIONS_OBJECT,
  handlers: {
    getSubscribers: restate.handlers.object.shared(async (ctx) => {
      const subscribers =
        (await ctx.get<string[]>(SUBSCRIBERS_STATE_NAME)) ?? [];
      return Promise.all(
        subscribers.map(async (id) => ({
          id,
          lastMessageIndex: (await ctx.get<number>(id)) ?? -1,
        }))
      );
    }),
    clearSubscription: restate.handlers.object.exclusive(
      async (ctx, id: string) => {
        const subscribers =
          (await ctx.get<string[]>(SUBSCRIBERS_STATE_NAME)) ?? [];
        await ctx.set<string[]>(
          SUBSCRIBERS_STATE_NAME,
          subscribers.filter((subscriberId) => subscriberId !== id)
        );
        await ctx.clear(id);
      }
    ),
    addSubscription: restate.handlers.object.exclusive(
      async (
        ctx,
        { id, lastMessageIndex }: { id: string; lastMessageIndex: number }
      ) => {
        const subscribers =
          (await ctx.get<string[]>(SUBSCRIBERS_STATE_NAME)) ?? [];
        await ctx.set<string[]>(SUBSCRIBERS_STATE_NAME, [...subscribers, id]);
        await ctx.set<number>(id, lastMessageIndex);
      }
    ),
  },
});

export type ChatSubscription = typeof chatSubscriptions;
