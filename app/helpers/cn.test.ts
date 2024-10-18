import { expect, test } from "bun:test";

import { cn } from "./cn";

test("removes conflicting classes using twMerge", () => {
	let classes = cn("text-red-500", "text-blue-500");

	expect(classes).toBe("text-blue-500");
});

test("merges multiple classes into a single string", () => {
	let classes = cn("text-red-500", "font-bold");

	expect(classes).toBe("text-red-500 font-bold");
});

test("removes empty classes", () => {
	let classes = cn("text-red-500", "", "font-bold");

	expect(classes).toBe("text-red-500 font-bold");
});

test("removes undefined classes", () => {
	let classes = cn("text-red-500", undefined, "font-bold");

	expect(classes).toBe("text-red-500 font-bold");
});

test("removes null classes", () => {
	let classes = cn("text-red-500", null, "font-bold");

	expect(classes).toBe("text-red-500 font-bold");
});

test("resolves nested arrays", () => {
	let classes = cn("text-red-500", ["font-bold", "bg-blue-500"]);

	expect(classes).toBe("text-red-500 font-bold bg-blue-500");
});

test("resolves nested objects", () => {
	let classes = cn("text-red-500", { "font-bold": true, "bg-blue-500": true });

	expect(classes).toBe("text-red-500 font-bold bg-blue-500");
});
