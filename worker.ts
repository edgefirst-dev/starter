import schema from "db:schema";

import { bootstrap } from "@edgefirst-dev/core/worker";
import { createRequestHandler } from "react-router";

export default bootstrap(
	{ orm: { schema }, rateLimit: { limit: 1000, period: 60 } },
	{
		// @ts-expect-error The RR handler returns a Response with a different type
		async onRequest(request) {
			let handler = createRequestHandler(
				// @ts-expect-error The RR handler expects a different type
				() => import("./build/server/index.js"),
				"production",
			);

			// @ts-expect-error The RR handler exepcts a Request with a different type
			return await handler(request);
		},

		async onSchedule() {
			// Add your scheduled tasks here
		},

		async onQueue(batch) {
			// Process your queued messages here
			for (let message of batch.messages) message.ack();
		},
	},
);

declare module "@edgefirst-dev/core" {
	export interface Bindings {
		DB: D1Database;
		QUEUE: Queue;
		// 👇 Env variables
		GRAVATAR_API_TOKEN: string;
		SESSION_SECRET: string;
		APP_ENV: "development" | "production";
	}

	type Schema = typeof schema;
	export interface DatabaseSchema extends Schema {}
}
