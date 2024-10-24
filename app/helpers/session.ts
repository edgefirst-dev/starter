import { Cookies } from "app:lib/cookies";
import { SessionsRepository } from "app:repositories.server/sessions";
import { redirect } from "react-router";

export async function querySession(request: Request) {
	let sessionId = await Cookies.session.parse(request.headers.get("cookie"));
	if (!sessionId) return null;

	let [session] = await new SessionsRepository().findById(sessionId);
	if (session) return session;

	return null;
}

export async function getSession(request: Request, returnTo = "/register") {
	let session = await querySession(request);
	if (!session) throw redirect(returnTo);
	return session;
}

export async function createSession(input: SessionsRepository.CreateInput) {
	return await new SessionsRepository().create(input);
}

export async function deleteSession(request: Request) {
	let id = await Cookies.session.parse(request.headers.get("cookie"));
	return await new SessionsRepository().destroy(id);
}
