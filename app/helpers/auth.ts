import { Gravatar } from "app:clients/gravatar";
import { LoginStrategy } from "app:core/strategies/login";
import { RegisterStrategy } from "app:core/strategies/register";
import type { Membership } from "app:entities/membership";
import type { Team } from "app:entities/team";
import type { User } from "app:entities/user";
import { Cookies } from "app:helpers/cookies";
import { unauthorized } from "app:helpers/response";
import { createSession, getSession } from "app:helpers/session";
import { AuditLogsRepository } from "app:repositories.server/audit-logs";
import { AuthRepository } from "app:repositories.server/auth";
import { CredentialsRepository } from "app:repositories.server/credentials";
import { MembershipsRepository } from "app:repositories.server/memberships";
import { SessionsRepository } from "app:repositories.server/sessions";
import { TeamsRepository } from "app:repositories.server/teams";
import { UsersRepository } from "app:repositories.server/users";
import { geo, waitUntil } from "edgekitjs";
import { type AppLoadContext, redirect } from "react-router";
import { Authenticator } from "remix-auth";

interface Result {
	user: User;
	team: Team;
	memberships: Membership[];
}

const authenticator = new Authenticator<Result>();
const sessions = new SessionsRepository();

authenticator.use(
	new RegisterStrategy(
		{
			audits: new AuditLogsRepository(),
			auth: new AuthRepository(),
			gravatar: new Gravatar(),
			users: new UsersRepository(),
		},
		async (output) => {
			return {
				user: output.user,
				team: output.team,
				memberships: [output.membership],
			};
		},
	),
);

authenticator.use(
	new LoginStrategy(
		{
			audits: new AuditLogsRepository(),
			credentials: new CredentialsRepository(),
			memberships: new MembershipsRepository(),
			teams: new TeamsRepository(),
			users: new UsersRepository(),
		},
		async (output) => {
			return {
				user: output.user,
				team: output.team,
				memberships: output.memberships,
			};
		},
	),
);

/** Checks if the user is authenticated or not */
export async function isAuthenticated(request: Request) {
	return Boolean(await querySession(request));
}

/** Perform the register process */
export async function register(request: Request, context?: AppLoadContext) {
	let output = await authenticator.authenticate("register", request);

	let headers = await createSession({
		user: output.user,
		ip: context?.ip,
		ua: context?.ua,
		payload: {
			teamId: output.team.id,
			teams: output.memberships.map((m) => m.teamId),
			geo: { city: geo().city, country: geo().country },
		},
	});

	throw redirect("/profile", { headers });
}

/** Perform the login process */
export async function login(request: Request, context?: AppLoadContext) {
	let output = await authenticator.authenticate("login", request);

	let headers = await createSession({
		user: output.user,
		ip: context?.ip,
		ua: context?.ua,
		payload: {
			teamId: output.team.id,
			teams: output.memberships.map((m) => m.teamId),
		},
	});

	throw redirect("/profile", { headers });
}

/** Only allow access to a route to authenticated users */
export async function currentUser(request: Request): Promise<User> {
	let session = await getSession(request);
	if (!session) throw await requestAuthentication(request);

	let [user] = await new UsersRepository().findById(session.userId);
	if (!user) throw await requestAuthentication(request);

	return user;
}

/** Only allow access to a route to anonymous visitors */
export async function anonymous(request: Request, returnTo: string) {
	let session = await querySession(request);
	if (session) throw redirect(returnTo);
}

/** Only allow access to a route to authenticated root users */
export async function rootOnly(request: Request) {
	let user = await currentUser(request);
	if (user.isRoot) return user;
	throw unauthorized({ message: "Unauthorized" });
}

/** Logout the user by deleting the session, and clearing the cookie */
export async function logout(request: Request, returnTo = "/") {
	let headers = await terminateSession(request);
	throw redirect(returnTo, { headers });
}

// Private

async function terminateSession(
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

async function requestAuthentication(request: Request) {
	let cookie = await Cookies.returnTo.serialize(request.url);
	return redirect("/login", { headers: { "Set-Cookie": cookie } });
}

async function querySession(request: Request) {
	let session = await findSessionByCookie(request);

	if (!session) return null;

	if (session.hasExpired) {
		let headers = await terminateSession(request);
		headers.append(
			"Set-Cookie",
			await Cookies.expiredSession.serialize(session.userId),
		);
		throw redirect("/login", { headers });
	}

	waitUntil(sessions.recordActivity(session.id));
	return session;
}

async function findSessionByCookie(request: Request) {
	let sessionId = await Cookies.session.parse(request.headers.get("cookie"));
	if (!sessionId) return null;

	let [session] = await sessions.findById(sessionId);
	if (!session) return null;

	return session;
}
