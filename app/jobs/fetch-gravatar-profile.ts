import { Gravatar } from "app:clients/gravatar";
import { Jobs } from "app:core/job";
import { UsersRepository } from "app:repositories.server/users";
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import { Email } from "@edgefirst-dev/email";

export class FetchGravatarProfileJob extends Jobs<Input> {
	gravatar = new Gravatar();
	users = new UsersRepository();

	async validate(body: ObjectParser): Promise<Input> {
		return new Input(body);
	}

	async handle(input: Input): Promise<void> {
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
