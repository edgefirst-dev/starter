import { Session } from "app:entities/session";
import { Cookies } from "app:lib/cookies";
import { sessionStorage } from "@edgefirst-dev/core";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import { redirect } from "react-router";

export async function querySession(request: Request) {
	let sessionId = await Cookies.session.parse(request.headers.get("cookie"));
	if (!sessionId) return null;

	let session = await sessionStorage().read(sessionId);
	if (!session) return null;

	return new Session(new ObjectParser(session.data));
}

export async function getSession(request: Request, returnTo = "/register") {
	let session = await querySession(request);
	if (!session) throw redirect(returnTo);
	return session;
}
