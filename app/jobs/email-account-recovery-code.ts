import { Data } from "@edgefirst-dev/data";
import type { ObjectParser } from "@edgefirst-dev/data/parser";
import { Email, Job, StringParser } from "edgekitjs";

export class EmailAccountRecoveryCodeJob extends Job<Input> {
	readonly data = Input;

	async perform(input: Input): Promise<void> {
		console.info("Send", input.url.toString(), "to", input.email.toString());
		// TODO: Use your favorite email service to send the URL to the email in
		// the input
	}
}

export class Input extends Data<ObjectParser> {
	get email() {
		return Email.from(this.parser.string("email"));
	}

	get url() {
		return new StringParser(this.parser.string("url")).url();
	}
}
