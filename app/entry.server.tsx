import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";

const ABORT_DELAY = 5_000;

export default async function handleRequest(
	request: Request,
	status: number,
	headers: Headers,
	routerContext: EntryContext,
	_loadContext: AppLoadContext,
) {
	let userAgent = request.headers.get("user-agent");

	let stream = await renderToReadableStream(
		<ServerRouter
			context={routerContext}
			url={request.url}
			abortDelay={ABORT_DELAY}
		/>,
		{
			signal: request.signal,
			onError(error) {
				console.error(error);
				// biome-ignore lint/style/noParameterAssign: It's ok
				status = 500;
			},
		},
	);

	if (userAgent && isbot(userAgent)) await stream.allReady;

	headers.set("Content-Type", "text/html; charset=utf-8");
	headers.set("Transfer-Encoding", "chunked");

	return new Response(stream, { status, headers });
}
