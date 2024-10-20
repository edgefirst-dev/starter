import { Outlet } from "react-router";

export default function Component() {
	return (
		<div className="grid grid-cols-2 gap-8">
			<aside className="flex flex-col justify-between bg-neutral-50 p-8 pr-0 dark:bg-neutral-950">
				<h1 className="font-semibold text-2xl/none">Edge-first Starter</h1>

				<blockquote className="w-full max-w-xl text-lg/relaxed">
					“This library has saved me countless hours of work and helped me
					deliver stunning designs to my clients faster than ever before.”
					<br />
					Sofia Davis
				</blockquote>
			</aside>

			<main className="flex justify-center items-center min-h-dvh w-full">
				<div className="flex flex-col w-full max-w-md items-center gap-6 rounded-xl p-10">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
