import schema from "db:schema";

import jobsManager from "app:core/jobs-manager";
import { FetchGravatarProfileJob } from "app:jobs/fetch-gravatar-profile";
import { IPAddress } from "app:lib/ip-address.js";
import { UserAgent } from "app:lib/user-agent.js";
import type { Request, Response } from "@cloudflare/workers-types";
import { bootstrap } from "@edgefirst-dev/core/worker";
import { createRequestHandler } from "react-router";

export default bootstrap(
	{ orm: { schema }, rateLimit: { limit: 1000, period: 60 } },
	{
		async onRequest(request) {
			let handler = createRequestHandler(
				// @ts-expect-error The file may not exists in dev, or the type will be different
				() => import("./build/server/index.js"),
				"production",
			);

			let context = await getLoadContext(request);

			// @ts-expect-error The RR handler exepcts a Request with a different type
			return (await handler(request, context)) as Response;
		},

		async onSchedule() {
			// Add your scheduled tasks here
		},

		async onQueue(batch) {
			jobsManager.register(new FetchGravatarProfileJob());
			for (let message of batch.messages) await jobsManager.handle(message);
		},
	},
);

	return {
		ua: UserAgent.fromRequest(request),
		ip: IPAddress.fromRequest(request),
	};
async function getLoadContext(request: Request) {
}

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

declare module "react-router" {
	export interface AppLoadContext
		extends Awaited<ReturnType<typeof getLoadContext>> {}
}
