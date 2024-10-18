import { UsersRepository } from "app:repositories/users";
import schema from "db:schema";

import { orm, queue, request } from "@edgefirst-dev/core";
import { bootstrap } from "@edgefirst-dev/core/worker";

export default bootstrap(
	{ orm: { schema }, rateLimit: { limit: 1000, period: 60 } },
	{
		async onRequest() {
			queue().enqueue("count:users", {
				delay: 60,
			});

			let users = await new UsersRepository().findAll();
			let url = new URL(request().url);

			return new Response(
				`Hello from ${url.pathname}; Users "${users.length}"`,
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
		DB: D1Database;
		QUEUE: Queue;
		// 👇 Env variables
		GRAVATAR_API_TOKEN: string;
	}

	type Schema = typeof schema;
	export interface DatabaseSchema extends Schema {}
}
