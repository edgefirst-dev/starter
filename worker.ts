import schema from "db:schema";

import { orm, queue } from "@edgefirst-dev/core";
import { bootstrap } from "@edgefirst-dev/core/worker";
import { createRequestHandler } from "react-router";

export default bootstrap(
	{ orm: { schema }, rateLimit: { limit: 1000, period: 60 } },
	{
		// @ts-expect-error
		async onRequest(request) {
			let handler = createRequestHandler(
				() => import("./build/server/index.js"),
				"production",
			);

			queue().enqueue("count:users", { delay: 60 });

			// @ts-expect-error
			return await handler(request);
		},

		async onSchedule() {
			let users = await orm().query.users.findMany();
			console.log("Count of users", users.length);
		},

		async onQueue(batch) {
			for (let message of batch.messages) {
				let users = await orm().query.users.findMany();
				console.log("Count of users", users.length);
				message.ack();
			}
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
	}

	type Schema = typeof schema;
	export interface DatabaseSchema extends Schema {}
}
