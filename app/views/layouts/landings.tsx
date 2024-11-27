import auth from "app:helpers/auth";
import { ok } from "app:helpers/response";
import { Outlet } from "react-router";
import { Link } from "react-router";
import type { Route } from "./+types/landings";

export async function loader({ request }: Route.LoaderArgs) {
	return ok({ isSignedIn: await auth.isAuthenticated(request) });
}

export default function Component({ loaderData }: Route.ComponentProps) {
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
			<Outlet />
		</main>
	);
}
