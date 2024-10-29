import schema from "db:schema";

import { SyncUserWithGravatarJob } from "app:jobs/sync-user-with-gravatar.js";
import { CleanupSessionsTask } from "app:tasks/cleanup-sessions.js";
import type { Request, Response } from "@cloudflare/workers-types";
import { IPAddress, UserAgent } from "@edgefirst-dev/core";
import { bootstrap } from "@edgefirst-dev/core/worker";
import { createRequestHandler } from "react-router";

export default bootstrap({
	orm: { schema },

	rateLimit: { limit: 1000, period: 60 },

	jobs() {
		return [new SyncUserWithGravatarJob()];
	},

	tasks() {
		return [new CleanupSessionsTask().hourly()];
	},

	async onRequest(request) {
		let handler = createRequestHandler(
			// @ts-expect-error The file may not exists in dev, or the type will be different
			() => import("./build/server/index.js"),
			"production",
		);

		let context = await getLoadContext(request);

		// @ts-expect-error The RR handler expects a Request with a different type
		return (await handler(request, context)) as Response;
	},
});

async function getLoadContext(request: Request) {
	let ua = UserAgent.fromRequest(request);
	let ip = IPAddress.fromRequest(request);
	return { ua, ip };
}

declare module "@edgefirst-dev/core" {
	export interface Bindings {
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
