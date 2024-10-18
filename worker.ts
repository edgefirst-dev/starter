import { request } from "@edgefirst-dev/core";
import { Runtime } from "@edgefirst-dev/core/worker";

class Application extends Runtime {
  async onRequest() {
    let url = new URL(request().url);
    return new Response(`Hello from ${url.pathname}`, {
      status: 200,
      statusText: "OK",
    });
  }
}

export default new Application({ rateLimit: { limit: 1000, period: 60 } });

declare module "@edgefirst-dev/core" {
  export interface Bindings {}
}
