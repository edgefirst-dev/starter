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

			<header className="contents text-center">
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
					className="max-w-fit rounded-lg dark:bg-white px-5 py-2 dark:text-black outline-blue-500 text-white bg-black"
					href="https://github.com/edgefirst-dev/starter"
				>
					Get Started
				</a>
			</div>
		</main>
	);
}
