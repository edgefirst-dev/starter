import { cn } from "app:helpers/cn";
import type { ComponentProps } from "react";

export function Button(props: ComponentProps<"button">) {
	return (
		<button
			{...props}
			className={cn(
				"max-w-fit rounded-lg dark:bg-white px-5 py-2 dark:text-black outline-info-500 text-white bg-black",
				props.className,
			)}
		/>
	);
}
