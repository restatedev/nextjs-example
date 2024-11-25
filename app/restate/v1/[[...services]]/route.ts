import { endpoint } from "@/restate/endpoint";

export async function POST(req: Request) {
  return endpoint.handler().fetch(req);
}

export async function GET(req: Request) {
  return endpoint.handler().fetch(req);
}
