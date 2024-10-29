import type { User } from "app:entities/user";
import { Cookies } from "app:helpers/cookies";
import { unauthorized } from "app:helpers/response";
import { getSession, querySession } from "app:helpers/session";
import { UsersRepository } from "app:repositories.server/users";
import { redirect } from "react-router";

/** Only allow access to a route to authenticated users */
export async function authenticate(
	request: Request,
	returnTo?: string,
): Promise<User> {
	let session = await getSession(request);
	let [user] = await new UsersRepository().findById(session.userId);
	if (!user && returnTo) {
		throw redirect(returnTo, {
			headers: {
				"Set-Cookie": await Cookies.returnTo.serialize(request.url),
			},
		});
	}
	if (!user) throw unauthorized({ message: "Unauthorized" });
	return user;
}

/** Only allow access to a route to anonymous visitors */
export async function anonymous(request: Request, returnTo: string) {
	let session = await querySession(request);
	if (session) throw redirect(returnTo);
}

/** Only allow access to a route to authenticated root users */
export async function rootOnly(request: Request) {
	let user = await authenticate(request);
	if (user.isRoot) return user;
	throw unauthorized({ message: "Unauthorized" });
}

/** Checks if the user is authenticated or not */
export async function isAuthenticated(request: Request) {
	if (await querySession(request)) return true;
	return false;
}
