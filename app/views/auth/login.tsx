import { Button } from "app:components/button";
import { Spinner } from "app:components/spinner";
import { anonymous, login } from "app:helpers/auth";
import { cn } from "app:helpers/cn";
import { Cookies } from "app:helpers/cookies";
import { rateLimit } from "app:helpers/rate-limit";
import { badRequest, ok, unprocessableEntity } from "app:helpers/response";
import { UsersRepository } from "app:repositories.server/users";
import { Parser } from "@edgefirst-dev/data/parser";
import { Form, Link, useNavigation } from "react-router";
import type { Route } from "./+types/login";

export async function loader({ request }: Route.LoaderArgs) {
	await anonymous(request, "/profile");
	let userId = await Cookies.expiredSession.parse(
		request.headers.get("cookie"),
	);
	let users = userId ? await new UsersRepository().findById(userId) : null;
	return ok({ defaultEmail: users?.at(0)?.email.toString() ?? null });
}

export async function action({ request, context }: Route.ActionArgs) {
	await rateLimit(request.headers);

	try {
		await login(request, context);
	} catch (error) {
		if (error instanceof Parser.Error) {
			return unprocessableEntity({ error: error.message });
		}

		if (error instanceof Error) {
			return badRequest({ error: error.message });
		}
		throw error;
	}
}

export default function Component({
	loaderData,
	actionData,
}: Route.ComponentProps) {
	let navigation = useNavigation();
	let isPending = navigation.state !== "idle";

	return (
		<Form method="POST" className="contents">
			<h1 className="font-medium text-2xl/none">Access</h1>

			{actionData?.ok === false && (
				<p className="text-danger-500">{actionData.error}</p>
			)}

			<label className="flex flex-col w-full gap-3">
				<span className="px-5 text-sm/normal">Email Address</span>
				<input
					type="email"
					name="email"
					placeholder="john.doe@example.com"
					defaultValue={loaderData.defaultEmail ?? ""}
					autoCapitalize="off"
					className="w-full rounded-md border border-neutral-700 px-5 py-2 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-300"
				/>
			</label>

			<label className="flex flex-col w-full gap-3">
				<span className="px-5 text-sm/normal">Password</span>
				<input
					type="password"
					name="password"
					autoComplete="new-password"
					className="w-full rounded-md border border-neutral-700 px-5 py-2 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-300"
				/>
			</label>

			<footer className="flex justify-between items-center gap-4 w-full">
				<Link to="/register" className="hover:underline">
					First day? Register
				</Link>

				<Button type="submit" className="relative self-end">
					{isPending && (
						<span className="absolute inset-0 flex justify-center items-center">
							<Spinner aria-hidden className="size-5" />
						</span>
					)}
					<span className={cn({ invisible: isPending })}>Access</span>
				</Button>
			</footer>
		</Form>
	);
}
