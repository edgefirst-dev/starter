import { orm, queue, request } from "@edgefirst-dev/core";
import { bootstrap } from "@edgefirst-dev/core/worker";

import schema from "db:schema";

export default bootstrap(
	{ orm: { schema }, rateLimit: { limit: 1000, period: 60 } },
	{
		async onRequest(_, { ASSETS }) {
			let assetResponse = await ASSETS.fetch(request());
			if (assetResponse.ok) return assetResponse;

			queue().enqueue("count:users");

			let result = await orm().query.users.findMany();
			let url = new URL(request().url);
			return new Response(
				`Hello from ${url.pathname}; Users "${result.length}"`,
				{ status: 200, statusText: "OK" },
			);
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
		ASSETS: Fetcher;
		DB: D1Database;
		FS: R2Bucket;
		KV: KVNamespace;
		QUEUE: Queue;
	}

	type Schema = typeof schema;
	export interface DatabaseSchema extends Schema {}
}
