import { useIsAuthenticated } from "app:root";
import { Outlet } from "react-router";
import { Link } from "react-router";
import type { Route } from "./+types/landings";

export default function Component(_: Route.ComponentProps) {
	let isAuthenticated = useIsAuthenticated();
	return (
		<main className="min-h-dvh w-full flex flex-col justify-center items-center">
			<aside className="flex gap-2 absolute top-0 right-0 pt-4 pr-4">
				{isAuthenticated ? (
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
