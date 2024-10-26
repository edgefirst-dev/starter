import { fs } from "@edgefirst-dev/core";
import type { Data } from "@edgefirst-dev/data";
import { FormParser, ObjectParser } from "@edgefirst-dev/data/parser";
import { parseFormData } from "@mjackson/form-data-parser";

export namespace BodyParser {
	export type FileList<D extends Data<FormParser>> = Array<
		keyof D extends string
			? D[keyof D] extends "toJSON"
				? never
				: keyof D
			: never
	>;
}

export class BodyParser {
	private constructor(private request: Request) {}

	static from(request: Request) {
		return new BodyParser(request);
	}

	async formData<D extends Data<FormParser> = Data<FormParser>>(
		DataClass: new (parser: FormParser) => D,
		files: BodyParser.FileList<D> = [],
	) {
		let formData = await parseFormData(this.request, fs().uploadHandler(files));
		return new DataClass(new FormParser(formData));
	}

	async json<D extends Data<ObjectParser> = Data<ObjectParser>>(
		DataClass: new (parser: ObjectParser) => D,
	) {
		let json = await this.request.json();
		return new DataClass(new ObjectParser(json));
	}
}
