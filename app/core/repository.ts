import { orm } from "@edgefirst-dev/core";

export abstract class Repository {
	constructor(protected readonly db = orm()) {}
}
