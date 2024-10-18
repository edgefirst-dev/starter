import { Parser } from "@edgefirst-dev/data/parser";

export class NumberParser extends Parser<number> {
	#locales = ["en"];

	set locales(value: string | readonly string[]) {
		this.#locales = Intl.getCanonicalLocales(value);
	}

	currency(
		currency: string,
		options: Omit<Intl.NumberFormatOptions, "style"> = {},
	) {
		if (!Intl.supportedValuesOf("currency").includes(currency)) {
			throw new Error(`Currency ${currency} is not supported`);
		}

		return this.value.toLocaleString(this.#locales, {
			currency,
			...options,
			style: "currency",
		});
	}

	format(options: Omit<Intl.NumberFormatOptions, "style"> = {}) {
		return this.value.toLocaleString(this.#locales, {
			...options,
			style: "decimal",
		});
	}

	percent(options: Omit<Intl.NumberFormatOptions, "style"> = {}) {
		return (this.value / 100).toLocaleString(this.#locales, {
			...options,
			style: "percent",
		});
	}

	timestamp() {
		let date = new Date(this.value);
		if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
		return date;
	}

	fileSize() {
		let units = [
			"byte",
			"kilobyte",
			"megabyte",
			"gigabyte",
			"terabyte",
			"petabyte",
			"exabyte",
			"zettabyte",
			"yottabyte",
		];

		let index = 0;
		let size = this.value;
		while (size >= 1024 && index < units.length) {
			size /= 1024;
			index++;
		}

		return size.toLocaleString(this.#locales, {
			style: "unit",
			unit: units[index],
			unitDisplay: "narrow",
		});
	}
}
