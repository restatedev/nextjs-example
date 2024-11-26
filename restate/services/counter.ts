import * as restate from "@restatedev/restate-sdk";
import { COUNTER_OBJECT, COUNTER_STATE_NAME } from "./constants";

export const counter = restate.object({
  ...COUNTER_OBJECT,
  handlers: {
    add: async (ctx: restate.ObjectContext, amount: number) => {
      const current = await ctx.get<number>(COUNTER_STATE_NAME);
      const updated = (current ?? 0) + amount;
      ctx.set(COUNTER_STATE_NAME, updated);
      return updated;
    },
    current: async (ctx: restate.ObjectSharedContext): Promise<number> => {
      return (await ctx.get(COUNTER_STATE_NAME)) ?? 0;
    },
  },
});

export type Counter = typeof counter;
