import { Task } from "@edgefirst-dev/core";

export class GenerateReportTask extends Task {
	override async perform(): Promise<void> {
		console.info("Generating report...");
	}
}
