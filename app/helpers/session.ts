import { Cookies } from "app:helpers/cookies";
import { SessionsRepository } from "app:repositories.server/sessions";
import { waitUntil } from "@edgefirst-dev/core";
import { redirect } from "react-router";

export async function querySession(request: Request) {
	let repo = new SessionsRepository();

	let sessionId = await Cookies.session.parse(request.headers.get("cookie"));
	if (!sessionId) return null;

	let [session] = await repo.findById(sessionId);
	if (!session) return null;

	if (session.hasExpired) {
		let headers = await deleteSession(request);
		headers.append(
			"Set-Cookie",
			await Cookies.expiredSession.serialize(session.userId),
		);
		throw redirect("/login", { headers });
	}

	waitUntil(repo.recordActivity(session.id));
	return session;
}

export async function getSession(request: Request, returnTo = "/register") {
	let session = await querySession(request);
	if (!session) throw redirect(returnTo);
	return session;
}

export async function createSession(
	input: SessionsRepository.CreateInput,
	responseHeaders = new Headers(),
) {
	let session = await new SessionsRepository().create(input);
	responseHeaders.append(
		"Set-Cookie",
		await Cookies.session.serialize(session.id),
	);
	return responseHeaders;
}

export async function deleteSession(
	request: Request,
	responseHeaders = new Headers(),
) {
	let id = await Cookies.session.parse(request.headers.get("cookie"));
	await new SessionsRepository().destroy(id);
	responseHeaders.append(
		"Set-Cookie",
		await Cookies.session.serialize(null, { maxAge: 0 }),
	);
	responseHeaders.append(
		"Set-Cookie",
		await Cookies.expiredSession.serialize(null, { maxAge: 0 }),
	);
	return responseHeaders;
}
