import schema from "db:schema";

import { EmailAccountRecoveryCodeJob } from "app:jobs/email-account-recovery-code.js";
import { SyncUserWithGravatarJob } from "app:jobs/sync-user-with-gravatar.js";
import { CleanupSessionsTask } from "app:tasks/cleanup-sessions.js";
import type { Request, Response } from "@cloudflare/workers-types";
import { IPAddress, UserAgent } from "edgekitjs";
import { bootstrap } from "edgekitjs/worker";
import { createRequestHandler } from "react-router";

// @ts-expect-error - no types
import * as build from "virtual:react-router/server-build";

const handler = createRequestHandler(build);

export interface Env {
	// 👇 Env variables
	GRAVATAR_API_TOKEN: string;
	SESSION_SECRET: string;
	APP_ENV: "development" | "production";

	GH_CLIENT_ID: string;
	GH_CLIENT_SECRET: string;
	GH_REDIRECT_PATHNAME: string;
}

export default bootstrap({
	orm: { schema },

	rateLimit: { limit: 1000, period: 60 },

	jobs() {
		return [new SyncUserWithGravatarJob(), new EmailAccountRecoveryCodeJob()];
	},

	tasks() {
		return [new CleanupSessionsTask().hourly()];
	},

	async onRequest(request) {
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

declare module "edgekitjs" {
	export interface Environment extends Cloudflare.Env {}
	type Schema = typeof schema;
	export interface DatabaseSchema extends Schema {}
}

declare module "react-router" {
	export interface AppLoadContext
		extends Awaited<ReturnType<typeof getLoadContext>> {}
}

declare module "cloudflare:workers" {
	export namespace Cloudflare {
		export interface Env {
			// 👇 Env variables
			GRAVATAR_API_TOKEN: string;
			SESSION_SECRET: string;
			APP_ENV: "development" | "production";

			GH_CLIENT_ID: string;
			GH_CLIENT_SECRET: string;
			GH_REDIRECT_PATHNAME: string;
		}
	}
}
