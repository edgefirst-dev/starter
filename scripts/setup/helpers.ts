import consola from "consola";

export function confirm(message: string) {
	return consola.prompt(message, { type: "confirm" });
}

export async function ask(message: string, fallback?: string) {
	if (fallback) return fallback;
	let result = await consola.prompt(message, { required: true, type: "text" });
	return result?.trim();
}

export function createTokenURL() {
	let permissions = [
		{ key: "d1", type: "edit" },
		{ key: "workers_r2", type: "edit" },
		{ key: "workers_kv_storage", type: "edit" },
		{ key: "ai", type: "edit" },
		{ key: "workers_scripts", type: "edit" },
		{ key: "queues", type: "edit" },
		{ key: "browser_rendering", type: "edit" },
	];

	let url = new URL("https://dash.cloudflare.com/profile/api-tokens");
	url.searchParams.set("permissionGroupKeys", JSON.stringify(permissions));
	url.searchParams.set("name", "Edge-first API Token");

	return url;
}
