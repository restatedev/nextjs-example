import * as restate from "@restatedev/restate-sdk/fetch";
import { counter } from "./services/counter";
import { chatMessages } from "./services/chatMessages";
import { chatSubscriptions } from "./services/chatSubscriptions";

// Create the Restate endpoint to accept requests
export const endpoint = restate
  .endpoint()
  .bind(counter)
  .bind(chatMessages)
  .bind(chatSubscriptions);
