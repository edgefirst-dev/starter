import * as Path from "node:path";
import * as Readline from "node:readline/promises";
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

config({ path: "./.dev.vars" });

try {
	/** The paths the setup will use to create new files */
	let paths = {
		vars: Path.resolve("./.dev.vars"),
		wrangler: Path.resolve("./wrangler.toml"),
	};

	/** Readline instance used to ask user questions */
	let rl = Readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	/** The project name from the use */
	let projectName = await rl.question(
		"What is your project name? (all lowercase and with dashes to separate words) ",
	);

	projectName = projectName.trim();
	projectName = parameterize(projectName);

	if (projectName === "") {
		consola.error("Project name is required.");
		process.exit(1);
	}
	let apiToken = process.env.CLOUDFLARE_API_TOKEN;
	apiToken ??= await rl.question("What's your Cloudflare API token? ");

	let cf = new Cloudflare({ apiToken });

	let account = await Account.find(cf);

	let db = await Database.upsert(cf, account, projectName);
	let kv = await KVNamespace.upsert(cf, account, projectName);
	let r2 = await R2Bucket.upsert(cf, account, projectName);
	let queue = await Queue.upsert(cf, account, projectName);

	consola.info("Creating .dev.vars file with the app environment variables.");

	await write(
		paths.vars,
		`APP_ENV="development"

CLOUDFLARE_ACCOUNT_ID=${account.id}
CLOUDFLARE_DATABASE_ID=${db.name}
CLOUDFLARE_API_TOKEN=${apiToken}

GRAVATAR_API_TOKEN=""

VERIFIER_API_KEY=""`,
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

	process.exit(0);
} catch (error) {
	if (error instanceof Error) console.error(error.message);
	process.exit(1);
}
