import { describe, expect, test } from "bun:test";

import { ObjectParser } from "@edgefirst-dev/data/parser";
import { GravatarProfile } from "./gravatar-profile";

describe(GravatarProfile.name, () => {
	let data = {
		display_name: "John Doe",
		pronouns: "he/him",
		job_title: "Software Engineer",
		company: "Acme Inc",
		location: "San Francisco, CA",
	};

	test("#constructor", () => {
		let profile = new GravatarProfile(new ObjectParser(data));
		expect(profile).toBeInstanceOf(GravatarProfile);
	});

	test("get displayName", () => {
		let profile = new GravatarProfile(new ObjectParser(data));
		expect(profile.displayName).toBe("John Doe");
	});

	test("get pronouns", () => {
		let profile = new GravatarProfile(new ObjectParser(data));
		expect(profile.pronouns).toBe("he/him");
	});

	test("get jobTitle", () => {
		let profile = new GravatarProfile(new ObjectParser(data));
		expect(profile.jobTitle).toBe("Software Engineer");
	});

	test("get company", () => {
		let profile = new GravatarProfile(new ObjectParser(data));
		expect(profile.company).toBe("Acme Inc");
	});

	test("get location", () => {
		let profile = new GravatarProfile(new ObjectParser(data));
		expect(profile.location).toBe("San Francisco, CA");
	});
});
