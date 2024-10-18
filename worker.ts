import { orm, request } from "@edgefirst-dev/core";
import { bootstrap } from "@edgefirst-dev/core/worker";

import schema from "db:schema";

export default bootstrap(
  { orm: { schema }, rateLimit: { limit: 1000, period: 60 } },
  {
    async onRequest() {
      let result = await orm().query.users.findMany();
      let url = new URL(request().url);
      return new Response(
        `Hello from ${url.pathname}; Users "${result.length}"`,
        { status: 200, statusText: "OK" }
      );
    },
  }
);

declare module "@edgefirst-dev/core" {
  export interface Bindings {
    DB: D1Database;
  }

  type Schema = typeof schema;
  export interface DatabaseSchema extends Schema {}
}
