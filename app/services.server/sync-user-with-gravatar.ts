import { Gravatar } from "app:clients/gravatar";
import { UsersRepository } from "app:repositories.server/users";

import { Email } from "edgekitjs";

export async function syncUserWithGravatar(
	input: syncUserWithGravatar.Input,
	deps: syncUserWithGravatar.Dependencies = {
		gravatar: new Gravatar(),
		users: new UsersRepository(),
	},
) {
	let [user] = await deps.users.findByEmail(input.email);
	if (!user) throw new Error("User not found");
	let profile = await deps.gravatar.profile(input.email);
	await deps.users.update(user.id, { displayName: profile.displayName });
}

export namespace syncUserWithGravatar {
	export interface Input {
		readonly email: Email;
	}

	export interface Dependencies {
		gravatar: {
			profile(email: Email): Promise<{ readonly displayName: string }>;
		};
		users: {
			findByEmail(email: Email): Promise<readonly { readonly id: string }[]>;
			update(id: string, data: { readonly displayName: string }): Promise<void>;
		};
	}
}
