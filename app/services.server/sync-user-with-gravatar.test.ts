import { describe, expect, mock, test } from "bun:test";

import { Email } from "edgekitjs";
import { syncUserWithGravatar } from "./sync-user-with-gravatar";

describe(syncUserWithGravatar.name, () => {
	let email = Email.from("john.doe@company.com");
	let gravatar = {
		profile: mock().mockImplementation(async () => ({
			displayName: "John Doe",
		})),
	};

	let users = {
		findByEmail: mock(),
		update: mock(),
	};

	test("it works", async () => {
		users.findByEmail.mockImplementation(async () => [{ id: "1" }]);

		await syncUserWithGravatar({ email }, { gravatar, users });

		expect(users.findByEmail).toHaveBeenCalledWith(email);
		expect(gravatar.profile).toHaveBeenCalledWith(email);
		expect(users.update).toHaveBeenCalledWith("1", { displayName: "John Doe" });
	});

	test("it throws an error if the user is not found", async () => {
		users.findByEmail.mockImplementation(async () => []);
		expect(
			syncUserWithGravatar({ email }, { gravatar, users }),
		).rejects.toThrow("User not found");
	});
});
