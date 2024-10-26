import { configDotenv } from "dotenv";
import { defineConfig } from "drizzle-kit";

configDotenv({ path: ".dev.vars" });

const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_API_TOKEN } =
	process.env;

if (!CLOUDFLARE_ACCOUNT_ID) throw new Error("Missing Cloudflare account ID");
if (!CLOUDFLARE_DATABASE_ID) throw new Error("Missing Cloudflare database ID");
if (!CLOUDFLARE_API_TOKEN) throw new Error("Missing Cloudflare API token");

export default defineConfig({
	dialect: "sqlite", // D1 uses SQLite
	driver: "d1-http", // Configure to use D1 over HTTP
	migrations: { prefix: "timestamp" }, // Add a timestamp prefix to migrations
	strict: true, // Enable strict mode
	schema: "./db/schema.ts", // Set the schema file path
	out: "./db/migrations", // Set where we will store the migrations
	// Configure the database credentials so it can connect to Cloudflare
	dbCredentials: {
		accountId: CLOUDFLARE_ACCOUNT_ID,
		databaseId: CLOUDFLARE_DATABASE_ID,
		token: CLOUDFLARE_API_TOKEN,
	},
});
