import type { Data } from "@edgefirst-dev/data";
import { FormParser } from "@edgefirst-dev/data/parser";
import { parseFormData } from "@mjackson/form-data-parser";
import { fs } from "edgekitjs";

export async function parseBody<D extends Data<FormParser> = Data<FormParser>>(
	request: Request,
	DataClass: new (parser: FormParser) => D,
	files: parseBody.FileList<D> = [],
) {
	let formData = await parseFormData(request, fs().uploadHandler(files));
	return new DataClass(new FormParser(formData));
}

export namespace parseBody {
	export type FileList<D extends Data<FormParser>> = Array<
		keyof D extends string
			? D[keyof D] extends "toJSON"
				? never
				: keyof D
			: never
	>;
}
