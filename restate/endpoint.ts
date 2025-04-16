import * as restate from "@restatedev/restate-sdk/fetch";
import { chatMessages } from "./services/chatMessages";
import { chatSubscriptions } from "./services/chatSubscriptions";

// Create the Restate endpoint to accept requests
export const endpoint = restate
  .endpoint()
  .bind(chatMessages)
  .bind(chatSubscriptions);
