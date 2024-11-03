import { GravatarProfile } from "app:entities/gravatar-profile";
import { APIClient } from "@edgefirst-dev/api-client";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import type { Email } from "edgekitjs";
import { env } from "edgekitjs";

export class Gravatar extends APIClient {
	constructor() {
		super(new URL("https://api.gravatar.com"));
	}

	/**
	 * Fetches the Gravatar Profile API for a given email address and returns a
	 * Gravatar profile object with the data returned by the API.
	 * @param email The email address to fetch the profile for.
	 * @throws {Gravatar.NotFoundError} If the profile is not found.
	 * @throws {Gravatar.RateLimitError} If the rate limit is exceeded.
	 * @throws {Gravatar.ServerError} If the server returns an error.
	 * @returns A Gravatar profile object.
	 */
	async profile(email: Email) {
		let response = await this.get(`/v3/profiles/${email.hash}`);

		if (response.status === 404) throw new Gravatar.NotFoundError(email);
		if (!response.ok) throw new Gravatar.ServerError();

		return new GravatarProfile(new ObjectParser(await response.json()));
	}

	protected override async before(request: Request): Promise<Request> {
		let token = env().fetch("GRAVATAR_API_TOKEN");
		request.headers.set("Authorization", `Bearer ${token}`);
		return request;
	}

	protected override async after(response: Response): Promise<Response> {
		if (response.status === 429) throw new Gravatar.RateLimitError();
		return response;
	}
}

export namespace Gravatar {
	export class NotFoundError extends Error {
		override name = "GravatarNotFoundError";

		constructor(email: Email) {
			super(`Gravatar profile not found for ${email.toString()}`);
		}
	}

	export class RateLimitError extends Error {
		override name = "GravatarRateLimitError";
		override message = "Rate limit exceeded";
	}

	export class ServerError extends Error {
		override name = "GravatarServerError";
		override message = "Server error";
	}
}
