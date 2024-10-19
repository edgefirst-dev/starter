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
	return <h1>Not Found</h1>;
}
