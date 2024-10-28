import { rootOnly } from "app:helpers/auth";
import { ok } from "app:helpers/response";
import type * as Route from "types:layouts/+types.admin";
import { NavLink, Outlet } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
	await rootOnly(request);
	return ok(null);
}

export default function Component() {
	return (
		<div>
			<div className="border-b border-neutral-500">
				<header className="flex flex-row gap-8 max-w-screen-xl mx-auto items-center py-2">
					<h1>Admin Panel</h1>

					<nav>
						<ul className="flex flex-row">
							<li>
								<NavLink
									to="/admin/dashboard"
									className="py-1.5 px-2 flex items-end justify-center hover:bg-neutral-800 rounded"
								>
									Dashboard
								</NavLink>
							</li>

							<li>
								<NavLink
									to="/admin/users"
									className="py-1.5 px-2 flex items-end justify-center hover:bg-neutral-800 rounded"
								>
									Users
								</NavLink>
							</li>
						</ul>
					</nav>
				</header>
			</div>

			<main className="max-w-screen-xl mx-auto py-24 max-xl:px-5">
				<Outlet />
			</main>
		</div>
	);
}
