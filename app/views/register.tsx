import { anonymous } from "app:helpers/auth";
import { rateLimit } from "app:helpers/rate-limit";
import { badRequest, ok, unprocessableEntity } from "app:helpers/response";
import { BodyParser } from "app:lib/body-parser";
import { Cookies } from "app:lib/cookies";
import { Password } from "app:lib/password";
import { register } from "app:services.server/auth/register";
import type * as Route from "types:views/+types.register";
import { sessionStorage } from "@edgefirst-dev/core";
import { Data } from "@edgefirst-dev/data";
import { type FormParser, Parser } from "@edgefirst-dev/data/parser";
import { Email } from "@edgefirst-dev/email";
import { Form, redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
	await anonymous(request, "/profile");
	return ok(null);
}

export async function action({ request }: Route.ActionArgs) {
	await rateLimit(request.headers);

	try {
		let data = await BodyParser.from(request).formData(
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

		let session = await sessionStorage().read();

		session.set("userId", user.id);
		session.set("teamId", team.id);
		session.set("teams", [membership.teamId]);

		await sessionStorage().save(session);

		let headers = new Headers({
			"set-cookie": await Cookies.session.serialize(session.id),
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
					defaultValue="hello@sergiodxa.com"
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
					defaultValue="soswad-cicbat-syDhe5"
					className="w-full rounded-md border border-neutral-700 px-5 py-2 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-300"
				/>
			</label>

			<button
				type="submit"
				className="max-w-fit self-end rounded-lg bg-neutral-600 px-5 py-2 text-neutral-100 outline-blue-500"
			>
				Sign Up
			</button>
		</Form>
	);
}
