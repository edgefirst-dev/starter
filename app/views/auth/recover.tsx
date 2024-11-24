import { Button } from "app:components/button";
import { Spinner } from "app:components/spinner";
import { parseBody } from "app:helpers/body-parser";
import { cn } from "app:helpers/cn";
import { badRequest, ok, unprocessableEntity } from "app:helpers/response";
import { recover } from "app:services.server/auth/recover";
import { Data } from "@edgefirst-dev/data";
import {
	FormParser,
	Parser,
	SearchParamsParser,
} from "@edgefirst-dev/data/parser";
import { Email, Password, StringParser, kv } from "edgekitjs";
import { Form, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/recover";

export async function loader({ request }: Route.LoaderArgs) {
	let searchParams = new SearchParamsParser(request);
	if (!searchParams.has("token")) return ok({ intent: "start" as const });

	let token = searchParams.get("token");
	let result = await kv().get(`recoveryCode:${token}`);
	if (!result.data) return ok({ intent: "start" as const });

	return ok({
		token,
		email: result.data.toString(),
		intent: "finish" as const,
	});
}

export async function action({ request }: Route.ActionArgs) {
	let data = await parseBody(
		request,
		class extends Data<FormParser> {
			get intent() {
				return new StringParser(this.parser.string("intent")).enum(
					"start",
					"finish",
				);
			}

			get email() {
				return Email.from(this.parser.string("email"));
			}

			get password() {
				return Password.from(this.parser.string("password"));
			}

			get token() {
				return this.parser.string("token");
			}
		},
	);

	try {
		await recover(data, new URL(request.url));
		if (data.intent === "start") return ok({});
		throw redirect("/login");
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
			<input type="hidden" name="intent" value={loaderData.intent} />

			{loaderData.intent === "finish" ? (
				<input type="hidden" name="token" value={loaderData.token} />
			) : null}

			<h1 className="font-medium text-2xl/none">Recover Account</h1>

			{loaderData.intent === "start" ? (
				<p>
					Forgot your password? No problem. Just let us know your email address
					and we will email you a password reset link that will allow you to
					choose a new one.
				</p>
			) : (
				<p>Enter your new password to reset your account.</p>
			)}

			{actionData?.ok === false && (
				<p className="text-danger-500">{actionData.error}</p>
			)}

			{actionData?.ok === true && (
				<p className="text-success-500">
					We have emailed your account recovery link.
				</p>
			)}

			<label className="flex flex-col w-full gap-3">
				<span className="px-5 text-sm/normal">Email Address</span>
				<input
					type="email"
					name="email"
					placeholder="john.doe@example.com"
					defaultValue={loaderData.intent === "finish" ? loaderData.email : ""}
					readOnly={loaderData.intent === "finish"}
					autoCapitalize="off"
					className="w-full rounded-md border border-neutral-700 px-5 py-2 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-300 dark:read-only:bg-neutral-900 dark:read-only:text-neutral-200 read-onky:dark:border-neutral-800"
				/>
			</label>

			{loaderData.intent === "finish" ? (
				<label className="flex flex-col w-full gap-3">
					<span className="px-5 text-sm/normal">Password</span>
					<input
						type="password"
						name="password"
						autoComplete="new-password"
						className="w-full rounded-md border border-neutral-700 px-5 py-2 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-300"
					/>
				</label>
			) : null}

			<footer className="flex justify-between items-center gap-4 w-full">
				<Button type="submit" className="relative self-end">
					{isPending && (
						<span className="absolute inset-0 flex justify-center items-center">
							<Spinner aria-hidden className="size-5" />
						</span>
					)}
					<span className={cn({ invisible: isPending })}>
						{loaderData.intent === "finish"
							? "Reset Password"
							: "Email password reset link"}
					</span>
				</Button>
			</footer>
		</Form>
	);
}
