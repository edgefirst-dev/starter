import { tooManyRequests } from "app:helpers/response";
import { rateLimit as edgeRateLimit } from "@edgefirst-dev/core";

export async function rateLimit(headers: Headers) {
	let ip = headers.get("cf-connecting-ip");
	if (!ip) return;

	let result = await edgeRateLimit().limit({ key: ip });

	if (!result.success) {
		throw tooManyRequests(
			{ error: "Too many requests" },
			{ headers: await edgeRateLimit().writeHttpMetadata({ key: ip }) },
		);
	}
}
