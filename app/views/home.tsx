import { AnchorButton } from "app:components/anchor-button";
import { isAuthenticated } from "app:helpers/auth";
import { ok } from "app:helpers/response";
import type * as Route from "types:views/+types.home";
import { Link } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
	return ok({ isSignedIn: await isAuthenticated(request) });
}

export default function Home({ loaderData }: Route.ComponentProps) {
	return (
		<main className="min-h-dvh w-full flex flex-col justify-center items-center">
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

			<div className="flex flex-col justify-center items-center gap-y-6 max-w-lg">
				<h1 className="text-4xl/none font-semibold text-center text-balance">
					Edge-first Starter Kit for React
				</h1>

				<p className="text-lg/normal text-center text-balance">
					Build lightning-fast React applications with edge computing. Deploy
					globally and scale effortlessly.
				</p>

				<AnchorButton
					reloadDocument
					to="https://github.com/edgefirst-dev/starter"
				>
					Get Started
				</AnchorButton>
			</div>
		</main>
	);
}
