import { AnchorButton } from "app:components/anchor-button";
import type { Route } from "./+types/home";

export default function Home(_: Route.ComponentProps) {
	return (
		<div className="flex flex-col justify-center items-center gap-y-6 max-w-lg">
			<h1 className="text-4xl/none font-semibold text-center text-balance">
				Edge-first Starter Kit for React
			</h1>

			<p className="text-lg/normal text-center text-balance">
				Build lightning-fast React applications with edge computing. Deploy
				globally and scale effortlessly.
			</p>

			<AnchorButton
				reloadDocument
				to="https://github.com/edgefirst-dev/starter"
			>
				Get Started
			</AnchorButton>
		</div>
	);
}
