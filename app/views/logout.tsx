import { Button } from "app:components/button";
import { Spinner } from "app:components/spinner";
import { authenticate } from "app:helpers/auth";
import { cn } from "app:helpers/cn";
import { ok } from "app:helpers/response";
import { deleteSession } from "app:helpers/session";
import type * as Route from "types:views/+types.logout";
import { Form, redirect, useNavigation } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
	await authenticate(request, "/register");
	return ok(null);
}

export async function action({ request }: Route.ActionArgs) {
	let headers = await deleteSession(request);
	return redirect("/", { headers });
}

export default function Component() {
	let navigation = useNavigation();
	let isPending = navigation.state !== "idle";

	return (
		<Form method="POST" className="contents">
			<h1 className="font-medium text-2xl/none">Sign Up</h1>

			<p>Do you want to leave the app?</p>

			<Button type="submit" className="relative">
				{isPending && (
					<span className="absolute inset-0 flex justify-center items-center">
						<Spinner aria-hidden className="size-5" />
					</span>
				)}
				<span className={cn({ invisible: isPending })}>Log Out</span>
			</Button>
		</Form>
	);
}
