import { Spinner } from "app:components/spinner";
import { authenticate } from "app:helpers/auth";
import { cn } from "app:helpers/cn";
import { ok } from "app:helpers/response";
import { Cookies } from "app:lib/cookies";
import type * as Route from "types:views/+types.logout";
import { sessionStorage } from "@edgefirst-dev/core";
import { Form, redirect, useNavigation } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
	await authenticate(request, "/register");
	return ok(null);
}

export async function action({ request }: Route.ActionArgs) {
	let sessionId = await Cookies.session.parse(request.headers.get("cookie"));
	await sessionStorage().destroy(sessionId);

	let headers = new Headers();
	headers.append(
		"set-cookie",
		await Cookies.session.serialize(null, { maxAge: 0 }),
	);

	return redirect("/", { headers });
}

export default function Component() {
	let navigation = useNavigation();
	let isSubmitting = navigation.state === "submitting";

	return (
		<Form method="POST" className="contents">
			<h1 className="font-medium text-2xl/none">Sign Up</h1>

			<p>Do you want to leave the app?</p>

			<button
				type="submit"
				className="relative max-w-fit self-end rounded-lg dark:bg-neutral-600 px-5 py-2 dark:text-neutral-100 outline-blue-500 text-neutral-900 bg-neutral-100"
			>
				{isSubmitting && (
					<span className="absolute inset-0 flex justify-center items-center">
						<Spinner aria-hidden className="size-5" />
					</span>
				)}
				<span className={cn({ invisible: isSubmitting })}>Log Out</span>
			</button>
		</Form>
	);
}
