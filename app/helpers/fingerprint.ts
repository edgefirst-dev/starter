import type { User } from "app:entities/user";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { IPAddress, UserAgent, request } from "edgekitjs";

export function fingerprint(user?: User) {
	let ua = UserAgent.fromRequest(request());
	let ip = IPAddress.fromRequest(request());

	let id: string[] = [];

	if (ip) id.push(ip.toString());
	if (ua) id.push(ua.toString());
	if (user) id.push(user.toString());

	return encodeHexLowerCase(sha256(new TextEncoder().encode(id.join(":"))));
}
