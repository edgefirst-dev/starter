import type { User } from "app:entities/user";
import { IPAddress, UserAgent, request } from "@edgefirst-dev/core";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";

export function fingerprint(user?: User) {
	let ua = UserAgent.fromRequest(request());
	let ip = IPAddress.fromRequest(request());

	let id = [ip?.toString(), ua?.toString()];
	if (user) id.push(user.toString());

	return encodeHexLowerCase(sha256(new TextEncoder().encode(id.join(":"))));
}
