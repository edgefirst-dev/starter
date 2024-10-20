import { queue } from "@edgefirst-dev/core";
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";

export abstract class Jobs<Input extends Data> {
	abstract validate(body: ObjectParser): Promise<Input>;
	abstract handle(input: Input): Promise<void>;

	static enqueue<T extends object>(message: T) {
		// biome-ignore lint/complexity/noThisInStatic: We need it for better DX
		queue().enqueue({ job: this.name, ...message });
	}
}
