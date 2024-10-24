import { Gravatar } from "app:clients/gravatar";
import { UsersRepository } from "app:repositories.server/users";

import { Email } from "@edgefirst-dev/email";

export async function syncUserWithGravatar(
	input: syncUserWithGravatar.Input,
	repos = { gravatar: new Gravatar(), users: new UsersRepository() },
) {
	let [user] = await repos.users.findByEmail(input.email);
	if (!user) throw new Error("User not found");
	let profile = await repos.gravatar.profile(input.email);
	await repos.users.update(user.id, { displayName: profile.displayName });
}

export namespace syncUserWithGravatar {
	export interface Input {
		readonly email: Email;
	}
}
