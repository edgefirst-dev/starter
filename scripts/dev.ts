/**
 * This script let us run the app in development mode using `wrangler dev` but
 * and also watch changes in our app and re-build the React Router app.
 *
 * This way we will lose the HMR and HDR features, but instead we will be able
 * to test our app inside Wrangler which will let use simulate a Cloudflare
 * Worker environment and get access to all bindings without depending on the
 * Cloudflare Proxy API.
 */
import * as FS from "node:fs/promises";
import Path from "node:path";
import { $ } from "bun";

const appPath = Path.join(import.meta.dir, "../app");
const buildPath = Path.join(import.meta.dir, "../build");

await Promise.all([retry(run), watch()]);

/**
 * This function will build the app and start the server.
 */
async function run() {
	await $`bun run build`.nothrow();
	await $`bun start --test-scheduled`;
}

/**
 * This function will recursively watch the app directory and delete the build
 * directory when a change is detected.
 */
async function watch() {
	for await (let _ of FS.watch(appPath, { recursive: true })) {
		await FS.rm(buildPath, { recursive: true });
	}
}

async function retry(cb: () => Promise<void>) {
	await cb().catch(() => retry(cb));
}
