import { ok } from "app:helpers/response";
import { Cookies } from "app:lib/cookies";
import schema from "db:schema";
import { env, orm } from "@edgefirst-dev/core";
import { Form, redirect } from "react-router";

export async function loader() {
	if (env().fetch("APP_ENV", "production") === "production") {
		throw redirect("/404");
	}
	return ok(null);
}

export async function action() {
	await orm().delete(schema.audits).execute();
	await orm().delete(schema.memberships).execute();
	await orm().delete(schema.teams).execute();
	await orm().delete(schema.credentials).execute();
	await orm().delete(schema.users).execute();

	let headers = new Headers();

	headers.set(
		"Set-Cookie",
		await Cookies.session.serialize(null, { expires: new Date(0) }),
	);

	throw redirect("/", { headers });
}

export default function Component() {
	return (
		<main className="flex items-center justify-center min-h-dvh w-full">
			<Form
				method="POST"
				className="flex flex-col w-full max-w-md gap-6 rounded-xl bg-neutral-50 dark:bg-neutral-900 p-10 shadow"
			>
				<h1 className="font-medium text-2xl/none">Purge Database</h1>

				<p>Are you sure you want to delete all the data from the database?</p>

				<button
					type="submit"
					className="max-w-fit self-end rounded-lg bg-neutral-600 px-5 py-2 text-neutral-100"
				>
					Purge
				</button>
			</Form>
		</main>
	);
}
