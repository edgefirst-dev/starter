import { authenticate } from "app:helpers/auth";
import { ok } from "app:helpers/response";
import type * as Route from "types:views/+types.profile";
import { Link } from "react-router";

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
		<main className="flex items-center justify-center min-h-dvh w-full">
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
		</main>
	);
}
