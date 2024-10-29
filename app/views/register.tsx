import { Button } from "app:components/button";
import { Spinner } from "app:components/spinner";
import { anonymous } from "app:helpers/auth";
import { parseBody } from "app:helpers/body-parser";
import { cn } from "app:helpers/cn";
import { rateLimit } from "app:helpers/rate-limit";
import { badRequest, ok, unprocessableEntity } from "app:helpers/response";
import { createSession } from "app:helpers/session";
import { register } from "app:services.server/auth/register";
import type * as Route from "types:views/+types.register";
import { Password, geo } from "@edgefirst-dev/core";
import { Data } from "@edgefirst-dev/data";
import { type FormParser, Parser } from "@edgefirst-dev/data/parser";
import { Email } from "@edgefirst-dev/email";
import { Form, Link, redirect, useNavigation } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
	await anonymous(request, "/profile");
	return ok(null);
}

export async function action({ request, context }: Route.ActionArgs) {
	await rateLimit(request.headers);

	try {
		let data = await parseBody(
			request,
			class extends Data<FormParser> implements register.Input {
				get displayName() {
					if (!this.parser.has("displayName")) return null;
					return this.parser.string("displayName");
				}

				get email() {
					return Email.from(this.parser.string("email"));
				}

				get password() {
					return Password.from(this.parser.string("password"));
				}
			},
		);

		let { user, team, membership } = await register(data);

		let headers = await createSession({
			user: user,
			ip: context?.ip,
			ua: context?.ua,
			payload: {
				teamId: team.id,
				teams: [membership.teamId],
				geo: { city: geo().city, country: geo().country },
			},
		});

		throw redirect("/profile", { headers });
	} catch (error) {
		if (error instanceof Parser.Error) {
			return unprocessableEntity({ error: error.message });
		}

		if (error instanceof Error) {
			console.error(error);
			return badRequest({ error: error.message });
		}

		throw error;
	}
}

export default function Component({ actionData }: Route.ComponentProps) {
	let navigation = useNavigation();
	let isPending = navigation.state !== "idle";

	return (
		<Form method="POST" className="contents">
			<h1 className="font-medium text-2xl/none">Create an account</h1>
			<p className="text-neutral-500">
				Enter your email below to create your account
			</p>

			{actionData?.ok === false && (
				<p className="text-danger-500">{actionData.error}</p>
			)}

			<label className="flex flex-col w-full gap-3">
				<span className="px-5 text-sm/normal">Email Address</span>
				<input
					type="email"
					name="email"
					placeholder="john.doe@example.com"
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
				<Link to="/login" className="hover:underline">
					Already have an account? Login
				</Link>

				<Button type="submit" className="relative self-end">
					{isPending && (
						<span className="absolute inset-0 flex justify-center items-center">
							<Spinner aria-hidden className="size-5" />
						</span>
					)}
					<span className={cn({ invisible: isPending })}>Sign Up</span>
				</Button>
			</footer>
		</Form>
	);
}
