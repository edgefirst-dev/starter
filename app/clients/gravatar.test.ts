import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { Email } from "@edgefirst-dev/email";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/native";
import { GravatarProfile } from "~/entities/gravatar-profile";
import { Gravatar } from "./gravatar";

mock.module("@edgefirst-dev/core", () => {
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
	let server = setupServer();
	let email = Email.from("john.doe@company.com");

	beforeAll(() => server.listen());
	afterAll(() => server.close());

	test("#constructor()", () => {
		const client = new Gravatar();
		expect(client).toBeInstanceOf(Gravatar);
	});

	test("#profile()", async () => {
		let client = new Gravatar();

		server.resetHandlers(
			http.get("https://gravatar.com/:hash.json", () => {
				return HttpResponse.json(mockResponse);
			}),
		);

		expect(client.profile(email)).resolves.toBeInstanceOf(GravatarProfile);
	});

	test("#profile() with error", async () => {
		let client = new Gravatar();

		server.resetHandlers(
			http.get("https://gravatar.com/:hash.json", () => {
				return new HttpResponse(null, { status: 404 });
			}),
		);

		expect(client.profile(email)).rejects.toThrowError(Gravatar.NotFoundError);
	});

	test("#profile() with rate limit error", async () => {
		let client = new Gravatar();

		server.resetHandlers(
			http.get("https://gravatar.com/:hash.json", () => {
				return new HttpResponse(null, { status: 429 });
			}),
		);

		expect(client.profile(email)).rejects.toThrowError(Gravatar.RateLimitError);
	});

	test("#profile() with server error", async () => {
		let client = new Gravatar();

		server.resetHandlers(
			http.get("https://gravatar.com/:hash.json", () => {
				return new HttpResponse(null, { status: 500 });
			}),
		);

		expect(client.profile(email)).rejects.toThrowError(Gravatar.ServerError);
	});

	test("#displayName", async () => {
		let client = new Gravatar();

		server.resetHandlers(
			http.get("https://gravatar.com/:hash.json", () => {
				return HttpResponse.json(mockResponse);
			}),
		);

		let profile = await client.profile(email);

		expect(profile.displayName).toBe("Sergio Xalambrí");
	});
});

const mockResponse = {
	entry: [
		{
			hash: "06c9ef83e41816017543a51874a9f609",
			requestHash: "hello32b8898f78",
			profileUrl: "https://gravatar.com/hello32b8898f78",
			preferredUsername: "hello32b8898f78",
			thumbnailUrl:
				"https://2.gravatar.com/avatar/06c9ef83e41816017543a51874a9f609",
			photos: [
				{
					value:
						"https://2.gravatar.com/avatar/06c9ef83e41816017543a51874a9f609",
					type: "thumbnail",
				},
			],
			displayName: "Sergio Xalambr\u00ed",
			pronouns: "He/Him",
			currentLocation: "Per\u00fa",
			job_title: "Web Developer",
			company: "Daffy.org",
			emails: [{ primary: "true", value: "hello@sergiodxa.com" }],
			accounts: [
				{
					domain: "twitter.com",
					display: "@sergiodxa",
					url: "https://twitter.com/sergiodxa",
					iconUrl: "https://gravatar.com/icons/twitter-alt.svg",
					username: "sergiodxa",
					verified: true,
					name: "Twitter",
					shortname: "twitter",
				},
				{
					domain: "github.com",
					display: "sergiodxa",
					url: "https://github.com/sergiodxa",
					iconUrl: "https://gravatar.com/icons/github.svg",
					username: "sergiodxa",
					verified: true,
					name: "GitHub",
					shortname: "github",
				},
				{
					domain: "twitch.tv",
					display: "sergiodxa",
					url: "https://twitch.tv/sergiodxa",
					iconUrl: "https://gravatar.com/icons/twitch.svg",
					username: "sergiodxa",
					verified: true,
					name: "Twitch",
					shortname: "twitch",
				},
			],
			payments: {
				paypalme: "https://www.paypal.com/paypalme/sergiodxa",
				Sponsor: "https://github.com/sponsors/sergiodxa",
			},
			profileBackground: { opacity: 0.01 },
			section_order: ["links", "photos", "verified-accounts", "interests"],
		},
	],
};
