import { authenticate } from "app:helpers/auth";
import { ok } from "app:helpers/response";
import { getSession } from "app:helpers/session";
import { SessionsRepository } from "app:repositories.server/sessions";
import type * as Route from "types:views/+types.profile";
import { Link } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
	let user = await authenticate(request, "/register");

	let [currentSession, sessions] = await Promise.all([
		getSession(request),
		new SessionsRepository().findByUser(user),
	]);

	return ok({
		user: {
			avatar: user.avatar,
			displayName: user.displayName,
			hasEmailVerified: user.hasEmailVerified,
		},

		sessions: sessions
			.filter((s) => !s.hasExpired)
			.map((session) => {
				return {
					id: session.id,
					ip: session.ip?.valueOf() ?? null,
					ua: session.ua
						? { browser: session.ua?.browser.name, os: session.ua?.os.name }
						: null,
					geo: { city: session.geo?.city, country: session.geo?.country },
					isCurrent: currentSession.id === session.id,
				};
			}),
	});
}

export default function Component({ loaderData }: Route.ComponentProps) {
	return (
		<main className="flex flex-col items-center justify-center min-h-dvh w-full gap-8">
			<aside className="flex gap-2 absolute top-0 right-0 pt-4 pr-4">
				<Link to="/logout" className="hover:underline">
					Leave
				</Link>
			</aside>

			<div className="w-full max-w-sm flex flex-col gap-3">
				<div className="flex flex-col gap-6 rounded-xl bg-neutral-50 dark:bg-neutral-900 p-10 shadow items-center justify-center aspect-square">
					<img
						src={loaderData.user.avatar}
						alt=""
						width={80}
						height={80}
						className="rounded-full border-2 border-neutral-300 bg-white"
					/>

					<h1 className="font-medium text-3xl/none">
						{loaderData.user.displayName}
					</h1>
				</div>

				{loaderData.user.hasEmailVerified ? null : (
					<p className="text-sm text-neutral-800 dark:text-neutral-100 px-4">
						Your email address has not been verified. Please check your email
						for a verification link.
					</p>
				)}
			</div>

			<section className="w-full max-w-screen-xl mx-auto border dark:border-l-neutral-700 p-6 rounded-xl">
				<header>
					<h2 className="text-xl/none font-semibold">Session</h2>
					<hr />
					<p className="text-lg/normal">
						This is a list of devices that have logged into your account. Revoke
						any sessions that you do not recognize.
					</p>
				</header>

				<ol>
					{loaderData.sessions.map((session) => {
						return (
							<li key={session.id}>
								<div>
									<p>
										{session.geo.city}, {session.geo.country} - {session.ip} -{" "}
										{session.ua?.browser}{" "}
										{session.isCurrent ? " (current)" : ""}
									</p>
								</div>
							</li>
						);
					})}
				</ol>
			</section>
		</main>
	);
}
