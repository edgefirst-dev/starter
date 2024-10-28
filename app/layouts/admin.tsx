import { rootOnly } from "app:helpers/auth";
import { ok } from "app:helpers/response";
import type * as Route from "types:layouts/+types.admin";
import { NavLink, Outlet } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
	await rootOnly(request);
	return ok(null);
}

export default function Component() {
	let links = [{ to: "/admin/dashboard", label: "Dashboard" }];

	return (
		<>
			<header className="border-b border-neutral-200 dark:border-neutral-500">
				<nav className="flex flex-row gap-8 max-w-screen-xl mx-auto items-center py-2">
					<ul className="flex flex-row">
						{links.map((link) => {
							return (
								<li key={link.to}>
									<NavLink
										to={link.to}
										className="py-1.5 px-2 flex items-end justify-center dark:hover:bg-neutral-800 hover:bg-neutral-100 rounded-md"
									>
										{link.label}
									</NavLink>
								</li>
							);
						})}
					</ul>
				</nav>
			</header>

			<main className="max-w-screen-lg mx-auto py-24 max-lg:px-5 w-full">
				<Outlet />
			</main>
		</>
	);
}
