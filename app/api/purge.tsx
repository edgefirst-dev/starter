import { Button } from "app:components/button";
import { Spinner } from "app:components/spinner";
import { cn } from "app:helpers/cn";
import { Cookies } from "app:helpers/cookies";
import { ok } from "app:helpers/response";
import schema from "db:schema";
import { orm } from "@edgefirst-dev/core";
import { Form, redirect, useNavigation } from "react-router";

export async function loader() {
	// if (env().fetch("APP_ENV", "production") === "production") {
	// 	throw redirect("/404");
	// }
	return ok(null);
}

export async function action() {
	await orm().delete(schema.sessions).execute();
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
	let navigation = useNavigation();
	let isPending = navigation.state !== "idle";

	return (
		<main className="flex items-center justify-center min-h-dvh w-full">
			<Form
				method="POST"
				className="flex flex-col w-full max-w-md gap-6 rounded-xl bg-neutral-50 dark:bg-neutral-900 p-10 shadow"
			>
				<h1 className="font-medium text-2xl/none">Purge Database</h1>

				<p>Are you sure you want to delete all the data from the database?</p>

				<Button type="submit" className="relative self-end">
					{isPending && (
						<span className="absolute inset-0 flex justify-center items-center">
							<Spinner aria-hidden className="size-5" />
						</span>
					)}
					<span className={cn({ invisible: isPending })}>Purge</span>
				</Button>
			</Form>
		</main>
	);
}
