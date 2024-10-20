import { ok } from "app:helpers/response";
import { querySession } from "app:helpers/session";
import type * as Route from "types:views/+types.home";
import { Link } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
	let session = await querySession(request);
	if (session) return ok({ isSignedIn: true });
	return ok({ isSignedIn: false });
}

export default function Home({ loaderData }: Route.ComponentProps) {
	return (
		<main className="flex justify-center items-center flex-col min-h-dvh gap-8">
			<aside className="flex gap-2 absolute top-0 right-0 pt-4 pr-4">
				{loaderData.isSignedIn ? (
					<Link to="/profile" className="hover:underline">
						Profile
					</Link>
				) : (
					<>
						<Link to="/login" className="hover:underline">
							Login
						</Link>
						<Link to="/register" className="hover:underline">
							Register
						</Link>
					</>
				)}
			</aside>

			<header className="flex flex-col gap-4 text-center">
				<h1 className="font-bold text-3xl tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
					Edge-first Starter Kit for React
				</h1>
				<p className="mx-auto max-w-[700px] text-neutral-500 md:text-xl dark:text-neutral-400">
					Build lightning-fast React applications with edge computing. Deploy
					globally and scale effortlessly.
				</p>
			</header>

			<div className="flex gap-4">
				<a
					className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-10 py-3 font-medium text-base text-neutral-50 shadow transition-colors hover:bg-neutral-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:focus-visible:ring-neutral-300 dark:hover:bg-neutral-50/90"
					href="https://github.com/edgefirst-dev/starter"
				>
					Get Started
				</a>
			</div>
		</main>
	);
}
