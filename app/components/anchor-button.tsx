import { cn } from "app:helpers/cn";
import type { ComponentProps } from "react";
import { Link } from "react-router";

export function AnchorButton(props: ComponentProps<typeof Link>) {
	return (
		<Link
			{...props}
			className={cn(
				"max-w-fit rounded-lg dark:bg-white px-5 py-2 dark:text-black outline-info-500 text-white bg-black",
				props.className,
			)}
		/>
	);
}
