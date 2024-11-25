import * as restate from "@restatedev/restate-sdk/fetch";

// Template of a Restate service and handler
//
// Have a look at the TS QuickStart to learn how to run this: https://docs.restate.dev/get_started/quickstart?sdk=ts
//

const greet = async (ctx: restate.Context, greeting: string) => {
  return `${greeting}!`;
};

// Create the Restate server to accept requests
const endpoint = restate
  .endpoint()
  .bind(
    restate.service({
      name: "Greeter",
      handlers: { greet },
    })
  )
  .bind(
    restate.service({
      name: "AnotherGreeter",
      handlers: { greet },
    })
  );

export async function POST(req: Request) {
  const restateRequest = new Request(req.url.replace("/restate", ""), {
    ...req,
    method: req.method,
    headers: req.headers,
    body: req.body,
    duplex: "half",
  } as RequestInit);
  const result = await endpoint.handler().fetch(restateRequest);

  return result;
}

export async function GET(req: Request) {
  const restateRequest = new Request(req.url.replace("/restate", ""), {
    ...req,
    method: req.method,
    headers: req.headers,
  });
  const result = await endpoint.handler().fetch(restateRequest);

  return result;
}
