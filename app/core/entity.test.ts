import { describe, expect, test } from "bun:test";

import type { CUID } from "app:lib/string-parser";
import { TableEntity } from "./entity";

describe(TableEntity.name, () => {
	let data = {
		id: "a3j3p00nmf5fnhggm9zqc6l8" as CUID,
		createdAt: new Date(),
		updatedAt: new Date(),
		name: "John Doe",
	};

	class TestModel extends TableEntity {
		get name() {
			return this.parser.string("name");
		}
	}

	test(".from()", () => {
		let model = TestModel.from(data);
		expect(model).toBeInstanceOf(TestModel);
	});

	test("#id", () => {
		let model = TestModel.from(data);
		expect(model.id).toBe(data.id);
	});

	test("#createdAt", () => {
		let model = TestModel.from(data);
		expect(model.createdAt).toEqual(data.createdAt);
	});

	test("#updatedAt", () => {
		let model = TestModel.from(data);
		expect(model.updatedAt).toEqual(data.updatedAt);
	});

	test("#toString()", () => {
		let model = TestModel.from(data);
		expect(model.toString()).toBe(`test-model:${data.id}`);
	});
});
