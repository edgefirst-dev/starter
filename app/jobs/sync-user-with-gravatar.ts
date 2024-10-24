import { Gravatar } from "app:clients/gravatar";
import { UsersRepository } from "app:repositories.server/users";
import { Job } from "@edgefirst-dev/core";
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import { Email } from "@edgefirst-dev/email";

import { syncUserWithGravatar } from "app:services.server/sync-user-with-gravatar";

export class SyncUserWithGravatarJob extends Job<Input> {
	private readonly gravatar = new Gravatar();
	private readonly users = new UsersRepository();

	readonly data = Input;

	async perform(input: Input): Promise<void> {
		await syncUserWithGravatar(input, {
			gravatar: this.gravatar,
			users: this.users,
		});
	}
}

export class Input
	extends Data<ObjectParser>
	implements syncUserWithGravatar.Input
{
	get email() {
		return Email.from(this.parser.string("email"));
	}
}
