import * as Path from "node:path";
import * as Util from "node:util";
import { $, write } from "bun";
import { Cloudflare } from "cloudflare";
import consola from "consola";
import { config } from "dotenv";
import { parameterize } from "inflected";
import { Account } from "./setup/account";
import { Database } from "./setup/d1-database";
import { KVNamespace } from "./setup/kv-namespace";
import { Queue } from "./setup/queue";
import { R2Bucket } from "./setup/r2-bucket";
import { Secret } from "./setup/secret";
import { Worker } from "./setup/worker";

config({ path: "./.dev.vars" });

try {
	/** The paths the setup will use to create new files */
	let paths = {
		vars: Path.resolve("./.dev.vars"),
		wrangler: Path.resolve("./wrangler.toml"),
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

	/** Check if we can get the CF API token from env or ask the user */
	let apiToken = await ask(
		"Enter your Cloudflare API token if you have one.",
		Bun.env.CLOUDFLARE_API_TOKEN,
	);

	if (!apiToken) {
		consola.error("Cloudflare API token is required.");
		consola.info(`Create one going to ${createTokenURL()} and try again.`);
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

	/** We want to set the APP_ENV to production in the Worker */
	await Secret.create(cf, account, worker, "APP_ENV", "production");

	consola.info("Creating .dev.vars file with the app environment variables.");

	await write(
		paths.vars,
		`APP_ENV="development"

CLOUDFLARE_ACCOUNT_ID=${account.id}
CLOUDFLARE_DATABASE_ID=${db.name}
CLOUDFLARE_API_TOKEN=${apiToken}

GRAVATAR_API_TOKEN="${gravatar}"

VERIFIER_API_KEY="${verifier}"`,
	);

	consola.info("Updating wrangler.toml file with the worker setup.");

	await write(
		paths.wrangler,
		`name = "${projectName}"

main = "./worker.ts"

# Update the compatibility date to the date you want to lock to
compatibility_date = "2024-10-11"

# This is needed for AsyncLocalStorage to work
compatibility_flags = ["nodejs_compat_v2"]

# Set the development port to be 3000
dev.port = 3000

# Enable serving static assets from the \`./build/client\` directory
assets = { directory = "./build/client" }

# Enables the Browser Rendering service
# To use it locally, update the ./scripts/dev.ts file and add \`--remote\` after 
# the \`bun start\` command
browser = { binding = "BROWSER" }

# To be able to use assets in your Worker, Smart placement needs to be off
[placement]
mode = "off"

# Enable Observability to get logs of your Worker
[observability]
enabled = true

# Configure your D1 database
[[d1_databases]]
binding = "DB"
database_name = "${db.name}"
database_id = "${db.id}"
migrations_dir = "./db/migrations"

# Configure your KV namespace
[[kv_namespaces]]
binding = "KV"
id = "${kv.id}"

# Configure your R2 bucket
[[r2_buckets]]
binding = "FS"
bucket_name = "${r2.name}"

# Configure this worker as a queue producer
[[queues.producers]]
queue = "${queue.name}"
binding = "QUEUE"

# Configure this worker as a queue consumer
[[queues.consumers]]
queue = "${queue.name}"
# The maximum number of messages allowed in each batch
max_batch_size = 10
# The maximum number of seconds to wait until a batch is full
max_batch_timeout = 30
# The maximum number of retries for a message
max_retries = 10
# The name of another Queue to send a message if it fails processing at least max_retries times, uncomment to enable it
# dead_letter_queue = "NAME_OF_DEAD_LETTER_QUEUE"

# Enables the Workers AI service
# Note that using AI on development can incur additional costs as it uses Worker
# cloud resources and not your local machine
[ai]
binding = "AI"

# Note that this will trigger your Worker every minute, increasing your request
# count and potentially incurring additional costs
[triggers]
crons = ["* * * * *"]
`,
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

	if (await confirm("Do you want to clean up the setup files?")) {
		consola.info("Cleaning up the setup files.");
		await $`rm ./scripts/setup.ts`.quiet().nothrow();
		await $`rm -rf ./scripts/setup`.quiet().nothrow();
		await $`bun rm cloudflare consola`.quiet().nothrow();
	}

	consola.success("Setup completed successfully.");

	process.exit(0);
} catch (error) {
	if (error instanceof Error) console.error(error.message);
	process.exit(1);
}

function confirm(message: string) {
	return consola.prompt(message, { type: "confirm" });
}

async function ask(message: string, fallback?: string) {
	if (fallback) return fallback;
	let result = await consola.prompt(message, { required: true, type: "text" });
	return result?.trim();
}

function createTokenURL() {
	let permissions = [
		{ key: "d1", type: "edit" },
		{ key: "workers_r2", type: "edit" },
		{ key: "workers_kv_storage", type: "edit" },
		{ key: "ai", type: "edit" },
		{ key: "workers_scripts", type: "edit" },
		{ key: "queues", type: "edit" },
		{ key: "browser_rendering", type: "edit" },
	];

	let url = new URL("https://dash.cloudflare.com/profile/api-tokens");
	url.searchParams.set("permissionGroupKeys", JSON.stringify(permissions));
	url.searchParams.set("name", "Edge-first API Token");

	return url;
}
