import { unauthorized } from "app:helpers/response";
import { getSession } from "app:helpers/session";
import { Cookies } from "app:lib/cookies";
import { UsersRepository } from "app:repositories/users";
import { redirect } from "react-router";

export async function authenticate(request: Request, returnTo?: string) {
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
