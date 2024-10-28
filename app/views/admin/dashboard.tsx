import { rootOnly } from "app:helpers/auth";
import { ok } from "app:helpers/response";
import { UsersRepository } from "app:repositories.server/users";
import type * as Route from "types:views/admin/+types.dashboard";
import { NumberParser } from "@edgefirst-dev/core";

export async function loader({ request }: Route.LoaderArgs) {
	await rootOnly(request);

	let users = await new UsersRepository().count();

	return ok({ users: new NumberParser(users).format() });
}

export default function Component(props: Route.ComponentProps) {
	return (
		<div className="flex flex-col gap-8 items-start">
			<header>
				<h2 className="text-6xl/none font-semibold">Dashboard</h2>
			</header>

			<section className="overflow-hidden rounded-lg bg-neutral-900 px-4 py-5 shadow sm:p-6">
				<dt className="truncate text-sm font-medium text-gray-500">
					Total Users
				</dt>
				<dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
					{props.loaderData.users}
				</dd>
			</section>
		</div>
	);
}
