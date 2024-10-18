import { json } from "react-router";

export function ok<T>(data: T, init?: ResponseInit) {
	return json(
		{ ...data, ok: true as const },
		{ ...init, status: 200, statusText: "OK" },
	);
}

export function badRequest<T>(data: T, init?: ResponseInit) {
	return json(
		{ ...data, ok: false as const },
		{ ...init, status: 400, statusText: "Bad Request" },
	);
}

export function unauthorized<T>(data: T, init?: ResponseInit) {
	return json(
		{ ...data, ok: false as const },
		{ ...init, status: 401, statusText: "Unauthorized" },
	);
}

export function forbidden<T>(data: T, init?: ResponseInit) {
	return json(
		{ ...data, ok: false as const },
		{ ...init, status: 403, statusText: "Forbidden" },
	);
}

export function notFound<T>(data: T, init?: ResponseInit) {
	return json(
		{ ...data, ok: false as const },
		{ ...init, status: 404, statusText: "Not Found" },
	);
}

export function unprocessableEntity<T>(data: T, init?: ResponseInit) {
	return json(
		{ ...data, ok: false as const },
		{ ...init, status: 422, statusText: "Unprocessable Entity" },
	);
}

export function tooManyRequests<T>(data: T, init?: ResponseInit) {
	return json(
		{ ...data, ok: false as const },
		{ ...init, status: 429, statusText: "Too Many Requests" },
	);
}

export function internalServerError<T>(data: T, init?: ResponseInit) {
	return json(
		{ ...data, ok: false as const },
		{ ...init, status: 500, statusText: "Internal Server Error" },
	);
}
