import { parseBody } from "app:helpers/body-parser";
import { register } from "app:services.server/auth/register";
import { Data } from "@edgefirst-dev/data";
import type { FormParser } from "@edgefirst-dev/data/parser";
import { Email, Password } from "edgekitjs";
import { Strategy } from "remix-auth/strategy";

export class RegisterStrategy<User> extends Strategy<User, register.Output> {
	name = "register";

	override async authenticate(request: Request) {
		let input = await parseBody(request, DTO);
		let output = await register(input);
		return await this.verify(output);
	}
}

class DTO extends Data<FormParser> implements register.Input {
	get displayName() {
		if (!this.parser.has("displayName")) return null;
		return this.parser.string("displayName");
	}

	get email() {
		return Email.from(this.parser.string("email"));
	}

	get password() {
		return Password.from(this.parser.string("password"));
	}
}
