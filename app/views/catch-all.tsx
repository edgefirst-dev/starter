import { AnchorButton } from "app:components/anchor-button";
import { notFound } from "app:helpers/response";
import redirects from "config:redirects";
import type * as Route from "types:views/+types.catch-all";
import { generatePath, redirectDocument } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
	let url = new URL(request.url);

	for (const redirect of redirects(url)) {
		let match = redirect.source.exec(url);
		if (!match) continue;
		let location = generatePath(redirect.destination, match.pathname.groups);
		throw redirectDocument(location, redirect.permanent ? 301 : 302);
	}

	return notFound(null);
}

export default function Component() {
	return (
		<main className="min-h-dvh w-full flex flex-col justify-center items-center">
			<div className="flex flex-col justify-center items-center gap-y-6 max-w-lg">
				<h1 className="text-4xl/none font-semibold text-center text-balance">
					Page Not Found
				</h1>

				<p className="text-lg/normal text-center text-balance">
					We're sorry, but an unexpected error has occurred. Please try again
					later or contact support if the issue persists.
				</p>

				<AnchorButton to="/">Go to Homepage</AnchorButton>
			</div>
		</main>
	);
}
