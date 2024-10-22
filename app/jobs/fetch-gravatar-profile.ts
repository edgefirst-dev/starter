import { Gravatar } from "app:clients/gravatar";
import { UsersRepository } from "app:repositories.server/users";
import { Job } from "@edgefirst-dev/core";
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import { Email } from "@edgefirst-dev/email";

export class FetchGravatarProfileJob extends Job<Input> {
	private readonly gravatar = new Gravatar();
	private readonly users = new UsersRepository();

	readonly data = Input;

	async perform(input: Input): Promise<void> {
		let [user] = await this.users.findByEmail(input.email);
		if (!user) throw new Error("User not found");
		let profile = await this.gravatar.profile(input.email);
		await this.users.update(user, { displayName: profile.displayName });
	}
}

export class Input extends Data<ObjectParser> {
	get email() {
		return Email.from(this.parser.string("email"));
	}
}
