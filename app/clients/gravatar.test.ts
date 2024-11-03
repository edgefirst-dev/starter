import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { GravatarProfile } from "app:entities/gravatar-profile";
import { gravatar } from "app:mocks/server";
import { Email } from "edgekitjs";
import { setupServer } from "msw/native";
import { Gravatar } from "./gravatar";

mock.module("edgekitjs", () => {
	return {
		orm: mock(),
		env() {
			return {
				fetch(key: string) {
					return key;
				},
			};
		},
	};
});

describe(Gravatar.name, () => {
	let email = Email.from("john.doe@company.com");
	let server = setupServer();

	beforeAll(() => server.listen());
	afterAll(() => server.close());

	test("#constructor()", () => {
		const client = new Gravatar();
		expect(client).toBeInstanceOf(Gravatar);
	});

	test("#profile()", async () => {
		let client = new Gravatar();

		server.resetHandlers(gravatar.success);

		expect(client.profile(email)).resolves.toBeInstanceOf(GravatarProfile);
	});

	test("#profile() with error", async () => {
		let client = new Gravatar();

		server.resetHandlers(gravatar.notFoundError);

		expect(client.profile(email)).rejects.toThrowError(Gravatar.NotFoundError);
	});

	test("#profile() with rate limit error", async () => {
		let client = new Gravatar();

		server.resetHandlers(gravatar.rateLimitError);

		expect(client.profile(email)).rejects.toThrowError(Gravatar.RateLimitError);
	});

	test("#profile() with server error", async () => {
		let client = new Gravatar();

		server.resetHandlers(gravatar.serverError);

		expect(client.profile(email)).rejects.toThrowError(Gravatar.ServerError);
	});

	test("#displayName", async () => {
		let client = new Gravatar();

		server.resetHandlers(gravatar.success);

		let profile = await client.profile(email);

		expect(profile.displayName).toBe("Sergio Xalambrí");
	});
});

const mockResponse = {
	hash: "14330318de450e39207d3063ca9dc23698bba910562fdb497d50cc52e1bae0ea",
	display_name: "Sergio Xalambrí",
	location: "Perú",
	job_title: "Web Developer",
	company: "Daffy.org",
	pronouns: "He/Him",
};
