import { authenticate } from "app:helpers/auth";
import { ok } from "app:helpers/response";
import type * as Route from "types:views/+types.profile";

export async function loader({ request }: Route.LoaderArgs) {
	let user = await authenticate(request, "/register");

	return ok({
		user: {
			avatar: user.avatar,
			displayName: user.displayName,
			hasEmailVerified: user.hasEmailVerified,
		},
	});
}

export default function Component({ loaderData }: Route.ComponentProps) {
	return (
		<main className="mx-auto w-full max-w-xl py-24">
			<h1 className="font-medium text-3xl/none">Your Profile</h1>

			<div className="h-stack items-center gap-2 p-4">
				<img
					src={loaderData.user.avatar}
					alt=""
					width={40}
					height={40}
					className="rounded-full border-2 border-neutral-300 bg-white"
				/>

				<p>Welcome, {loaderData.user.displayName}</p>
			</div>

			{loaderData.user.hasEmailVerified ? null : (
				<p>
					Your email address has not been verified. Please check your email for
					a verification link.
				</p>
			)}
		</main>
	);
}
