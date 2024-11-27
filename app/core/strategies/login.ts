import { parseBody } from "app:helpers/body-parser";
import { login } from "app:services.server/auth/login";
import { Data } from "@edgefirst-dev/data";
import type { FormParser } from "@edgefirst-dev/data/parser";
import { Email, Password } from "edgekitjs";
import { Strategy } from "remix-auth/strategy";

export class LoginStrategy<User> extends Strategy<User, login.Output> {
	name = "login";

	override async authenticate(request: Request) {
		let input = await parseBody(request, DTO);
		let output = await login(input);
		return await this.verify(output);
	}
}

class DTO extends Data<FormParser> implements login.Input {
	get email() {
		return Email.from(this.parser.string("email"));
	}

	get password() {
		return Password.from(this.parser.string("password"));
	}
}
