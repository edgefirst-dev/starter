import * as Path from "node:path";
import * as Util from "node:util";
import { Octokit } from "@octokit/core";
import { $, write } from "bun";
import { Cloudflare } from "cloudflare";
import consola from "consola";
import { config } from "dotenv";
import { parameterize } from "inflected";
import { Account } from "./setup/cf/account";
import { Database } from "./setup/cf/d1-database";
import { KVNamespace } from "./setup/cf/kv-namespace";
import { Queue } from "./setup/cf/queue";
import { R2Bucket } from "./setup/cf/r2-bucket";
import { Secret } from "./setup/cf/secret";
import { Worker } from "./setup/cf/worker";
import { ActionSecret } from "./setup/gh/action-secret";
import { Repository } from "./setup/gh/repository";
import { User } from "./setup/gh/user";
import { ask, confirm, createTokenURL } from "./setup/helpers";
import { Package } from "./setup/package";

config({ path: "./.dev.vars" });

try {
	consola.box("Starting the setup process for your Edge-first App.");
	let pkg = await Package.read();

	/** The paths the setup will use to create new files */
	let paths = {
		vars: Path.resolve("./.dev.vars"),
		wrangler: Path.resolve("./wrangler.json"),
	};

	/** The project name from the use */
	let {
		positionals: [, , projectName],
	} = Util.parseArgs({ args: Bun.argv, allowPositionals: true });

	/** If it was not a positional argument, ask for it to the user */
	projectName ??= await consola.prompt("What is your project name?", {
		default: projectName,
		initial: projectName,
		required: true,
		type: "text",
	});

	projectName = projectName.trim();
	projectName = parameterize(projectName);

	if (projectName === "") {
		consola.error("Project name is required.");
		process.exit(1);
	}

	pkg.name = projectName;
	pkg.description = "A Cloudflare Worker project.";

	/** Check if we can get the CF API token from env or ask the user */
	let apiToken = await ask(
		"Enter your Cloudflare API token if you have one.",
		Bun.env.CLOUDFLARE_API_TOKEN,
	);

	if (!apiToken) {
		consola.warn("Cloudflare API token is required.");
		consola.info(
			"Create one with the required permissions going to:\n\t",
			createTokenURL().toString(),
		);
		process.exit(1);
	}

	/** Check if we can get the Gravatar API token from env or ask the user */
	let gravatar = await ask(
		"Do you have a Gravatar API token?",
		Bun.env.GRAVATAR_API_TOKEN,
	);

	/** Check if we can get the Verifier API key from env or ask the user */
	let verifier = await ask(
		"Do you have a Verifier API key?",
		Bun.env.VERIFIER_API_KEY,
	);

	/** Create a CF API client instance */
	let cf = new Cloudflare({ apiToken });

	/** Look up for the CF account to use */
	let account = await Account.find(cf);

	/** Find or create the resources of the app (DB, KV, FS and Queue) */
	let db = await Database.upsert(cf, account, projectName);
	let kv = await KVNamespace.upsert(cf, account, projectName);
	let r2 = await R2Bucket.upsert(cf, account, projectName);
	let queue = await Queue.upsert(cf, account, projectName);

	/** To set the secrets, we will first find a Worker instance or create one */
	let worker = await Worker.upsert(cf, account, projectName);

	/** If the app has a Gravatar API token, create a secret */
	if (gravatar) {
		await Secret.create(cf, account, worker, "GRAVATAR_API_TOKEN", gravatar);
	}

	/** If the app has a Verifier API key, create a secret */
	if (verifier) {
		await Secret.create(cf, account, worker, "VERIFIER_API_KEY", verifier);
	}

	consola.info("Creating .dev.vars file with the app environment variables.");

	await write(
		paths.vars,
		`CLOUDFLARE_ACCOUNT_ID=${account.id}
CLOUDFLARE_DATABASE_ID=${db.name}
CLOUDFLARE_API_TOKEN=${apiToken}

GRAVATAR_API_TOKEN="${gravatar}"

VERIFIER_API_KEY="${verifier}"`,
	);

	consola.info("Updating wrangler.toml file with the worker setup.");

	let today = new Date();

	await write(
		paths.wrangler,
		JSON.stringify(
			{
				$schema: "https://unpkg.com/wrangler@latest/config-schema.json",
				name: projectName,
				main: "./app/entry.worker.ts",
				compatibility_date: [
					today.getFullYear(),
					today.getMonth() + 1,
					today.getDate(),
				].join("-"),
				compatibility_flags: ["nodejs_compat"],
				workers_dev: true,
				dev: { port: 3000 },
				placement: { mode: "off" },
				observability: { enabled: true },
				assets: { directory: "./build/client" },
				browser: { binding: "BROWSER" },
				d1_databases: [
					{
						binding: "DB",
						database_name: db.name,
						database_id: db.id,
						migrations_dir: "./db/migrations",
					},
				],
				kv_namespaces: [{ binding: "KV", id: kv.id }],
				r2_buckets: [{ binding: "FS", bucket_name: r2.name }],
				queues: {
					consumers: [
						{
							queue: queue.name,
							max_batch_size: 10,
							max_batch_timeout: 30,
							max_retries: 10,
						},
					],
					producers: [{ binding: "QUEUE", queue: queue.name }],
				},
				ai: { binding: "AI" },
				triggers: { crons: ["* * * * *"] },
				vars: { APP_ENV: "development" },
				env: { production: { vars: { APP_ENV: "production" } } },
			},
			null,
			"\t",
		),
	);

	consola.info("Running the local database migrations.");

	await $`bun run db:migrate:local ${db.name}`.quiet().nothrow();

	consola.info("Running seed data against local database.");

	await $`bun run db:seed ${db.name}`.quiet().nothrow();

	if (await confirm("Do you want to deploy the worker now?")) {
		consola.info("Running migrations against the production database.");
		await $`bun run db:migrate --remote ${db.name}`.quiet().nothrow();
		consola.info("Building the application.");
		await $`bun run build`.quiet().nothrow();
		consola.info("Deploying the worker.");
		await $`bun run deploy`.quiet().nothrow();
		consola.success("Worker deployed successfully.");
	}

	if (await confirm("Do you want to configure your GitHub repository?")) {
		let auth = await ask("What's your GitHub API token?", Bun.env.GITHUB_TOKEN);

		try {
			let gh = new Octokit({ auth });

			let path = await ask(
				"What's your GitHub repository? (e.g. edgefirst-dev/my-app or my-app)",
			);

			let isOrg = path.includes("/");

			let [owner, repo]: [string | null, string] = isOrg
				? (path.split("/") as [string, string])
				: ([null, path] as const);

			if (!owner) {
				let user = await User.viewer(gh);
				owner = user.login;
			}

			let repository = await Repository.upsert(gh, owner, repo, isOrg);

			pkg.repository = repository;

			consola.info(`Configuring action secrets for ${owner}/${repo}.`);

			await ActionSecret.create(
				gh,
				owner,
				repo,
				"CLOUDFLARE_ACCOUNT_ID",
				account.id,
			);

			await ActionSecret.create(
				gh,
				owner,
				repo,
				"CLOUDFLARE_API_TOKEN",
				apiToken,
			);

			await ActionSecret.create(
				gh,
				owner,
				repo,
				"CLOUDFLARE_DATABASE_NAME",
				db.name,
			);
		} catch {
			consola.error(
				"Something failed when trying to setup GitHub, ensure the token in still valid and has the correct permissions `repo` and `read:user`.",
			);
			process.exit(1);
		}
	}

	await pkg.write(); // Save package.json

	if (await confirm("Do you want to clean up the setup files?")) {
		consola.info("Cleaning up the setup files.");
		await $`rm ./scripts/setup.ts`.quiet().nothrow(); // Delete setup script
		await $`rm -rf ./scripts/setup`.quiet().nothrow(); // Delete setup folder
		await $`bun rm cloudflare consola @types/libsodium-wrappers libsodium-wrappers`
			.quiet()
			.nothrow(); // Remove setup-only dependencies
	}

	consola.success("Setup completed successfully.");

	process.exit(0);
} catch (error) {
	if (error instanceof Error) console.error(error.message);
	consola.info(
		"If you need help, please open an issue at github.com/edgefirst-dev/starter",
	);

	consola.info(
		"If you want to start over, run `bun run setup` again, already created resources will be reused.",
	);

	process.exit(1);
}
