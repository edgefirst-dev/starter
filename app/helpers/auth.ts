import { LoginStrategy } from "app:core/strategies/login";
import { RegisterStrategy } from "app:core/strategies/register";
import type { Membership } from "app:entities/membership";
import type { Team } from "app:entities/team";
import type { User } from "app:entities/user";
import { Cookies } from "app:helpers/cookies";
import { unauthorized } from "app:helpers/response";
import {
	createSession,
	deleteSession,
	getSession,
	querySession,
} from "app:helpers/session";
import { UsersRepository } from "app:repositories.server/users";
import { geo } from "edgekitjs";
import { type AppLoadContext, redirect } from "react-router";
import { Authenticator as BaseAuthenticator } from "remix-auth";

interface Result {
	user: User;
	team: Team;
	memberships: Membership[];
}

class Authenticator extends BaseAuthenticator<Result> {
	constructor() {
		super();

		this.use(
			new RegisterStrategy(async (output) => {
				return {
					user: output.user,
					team: output.team,
					memberships: [output.membership],
				};
			}),
		);

		this.use(
			new LoginStrategy(async (output) => {
				return {
					user: output.user,
					team: output.team,
					memberships: output.memberships,
				};
			}),
		);
	}

	/** Perform the register process */
	async register(request: Request, context?: AppLoadContext) {
		let output = await this.authenticate("register", request);

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
	async login(request: Request, context?: AppLoadContext) {
		let output = await this.authenticate("login", request);

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
	async currentUser(request: Request, returnTo?: string): Promise<User> {
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
	async anonymous(request: Request, returnTo: string) {
		let session = await querySession(request);
		if (session) throw redirect(returnTo);
	}

	/** Only allow access to a route to authenticated root users */
	async rootOnly(request: Request) {
		let user = await this.currentUser(request);
		if (user.isRoot) return user;
		throw unauthorized({ message: "Unauthorized" });
	}

	/** Checks if the user is authenticated or not */
	async isAuthenticated(request: Request) {
		return Boolean(await querySession(request));
	}

	/** Logout the user by deleting the session, and clearing the cookie */
	async logout(request: Request, returnTo = "/") {
		let headers = await deleteSession(request);
		throw redirect(returnTo, { headers });
	}
}

export default new Authenticator();
