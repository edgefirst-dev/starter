import { AnchorButton } from "app:components/anchor-button";
import type { ReactNode } from "react";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteError,
} from "react-router";
import "./assets/tailwind.css";

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary() {
	let error = useRouteError();

	let title =
		error instanceof Error ? error.message : "Oops, something went wrong!";

	return (
		<main className="min-h-dvh w-full flex flex-col justify-center items-center">
			<div className="flex flex-col justify-center items-center gap-y-6 max-w-lg">
				<h1 className="text-4xl/none font-semibold text-center text-balance">
					{title}
				</h1>

				<p className="text-lg/normal text-center text-balance">
					We're sorry, but an unexpected error has occurred. Please try again
					later or contact support if the issue persists.
				</p>

				<AnchorButton to="/">Go to Homepage</AnchorButton>

				{error instanceof Error && error.stack ? (
					<pre className="bg-black text-white p-3 rounded-xl w-full overflow-x-auto mt-4">
						<code>{JSON.stringify(error.stack, null, "\t")}</code>
					</pre>
				) : null}
			</div>
		</main>
	);
}

export function Layout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			className="bg-white text-black dark:bg-black dark:text-white"
		>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="flex flex-col min-h-dvh w-screen">
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}
