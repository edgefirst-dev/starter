import { describe, expect, test } from "bun:test";
import { NumberParser } from "./number-parser";

describe(NumberParser.name, () => {
	describe("#currency", () => {
		test("with defaults", () => {
			let parser = new NumberParser(1234.56);
			expect(parser.currency("USD")).toBe("$1,234.56");
		});

		test("with options", () => {
			let parser = new NumberParser(1234.56);
			expect(
				parser.currency("USD", {
					minimumFractionDigits: 0,
					maximumFractionDigits: 0,
				}),
			).toBe("$1,235");
		});

		test("with different currency", () => {
			let parser = new NumberParser(1234.56);
			expect(parser.currency("EUR")).toBe("€1,234.56");
		});

		test("with different locale", () => {
			let parser = new NumberParser(1234.56);
			parser.locales = "es";
			expect(parser.currency("USD")).toBe("1234,56 US$");
		});
	});

	describe("#format", () => {
		test("with defaults", () => {
			let parser = new NumberParser(1234.56);
			expect(parser.format()).toBe("1,234.56");
		});

		test("with options", () => {
			let parser = new NumberParser(1234.56);
			expect(
				parser.format({ minimumFractionDigits: 0, maximumFractionDigits: 0 }),
			).toBe("1,235");
		});

		test("with different locale", () => {
			let parser = new NumberParser(1234.56);
			parser.locales = "de";
			expect(parser.format()).toBe("1.234,56");
		});
	});

	describe("#percent", () => {
		test("with defaults", () => {
			let parser = new NumberParser(12.34);
			expect(parser.percent()).toBe("12%");
		});

		test("with options", () => {
			let parser = new NumberParser(12.34);
			expect(
				parser.percent({ minimumFractionDigits: 0, maximumFractionDigits: 0 }),
			).toBe("12%");
		});

		test("with different locale", () => {
			let parser = new NumberParser(12.34);
			parser.locales = "es";
			expect(parser.percent()).toBe("12 %");
		});
	});

	describe("#timestamp", () => {
		test("valid date", () => {
			let parser = new NumberParser(Date.now());
			expect(parser.timestamp()).toBeInstanceOf(Date);
		});

		test("invalid date", () => {
			let parser = new NumberParser(Number.NaN);
			expect(() => {
				parser.timestamp();
			}).toThrow("Invalid date");
		});
	});

	describe("#fileSize", () => {
		test("bytes", () => {
			let parser = new NumberParser(100);
			expect(parser.fileSize()).toBe("100B");
		});

		test("kilobytes", () => {
			let parser = new NumberParser(1024);
			expect(parser.fileSize()).toBe("1kB");
		});

		test("megabytes", () => {
			let parser = new NumberParser(1024 * 1024);
			expect(parser.fileSize()).toBe("1MB");
		});

		test("gigabytes", () => {
			let parser = new NumberParser(1024 * 1024 * 1024);
			expect(parser.fileSize()).toBe("1GB");
		});

		test("terabytes", () => {
			let parser = new NumberParser(1024 * 1024 * 1024 * 1024);
			expect(parser.fileSize()).toBe("1TB");
		});

		test("petabytes", () => {
			let parser = new NumberParser(1024 * 1024 * 1024 * 1024 * 1024);
			expect(parser.fileSize()).toBe("1PB");
		});
	});
});
