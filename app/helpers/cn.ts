import type { ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export type ClassName = ClassValue;

/**
 * Combine multiple class names into a single string using clsx, later merge
 * Tailwind classes to keep the last classes in the string and avoid conflicts
 */
export function cn(...classes: ClassName[]) {
	return twMerge(clsx(...classes));
}
