import { request } from "@edgefirst-dev/core";
import { bootstrap } from "@edgefirst-dev/core/worker";

export default bootstrap(
  { rateLimit: { limit: 1000, period: 60 } },
  {
    async onRequest() {
      let url = new URL(request().url);
      return new Response(`Hello from ${url.pathname}`, {
        status: 200,
        statusText: "OK",
      });
    },
  }
);

declare module "@edgefirst-dev/core" {
  export interface Bindings {}
}
