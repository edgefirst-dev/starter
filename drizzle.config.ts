import { configDotenv } from "dotenv";
import { defineConfig } from "drizzle-kit";

configDotenv({ path: ".dev.vars" });

const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_API_TOKEN } =
	process.env;

if (!CLOUDFLARE_ACCOUNT_ID) throw new Error("Missing Cloudflare account ID");
if (!CLOUDFLARE_DATABASE_ID) throw new Error("Missing Cloudflare database ID");
if (!CLOUDFLARE_API_TOKEN) throw new Error("Missing Cloudflare API token");

export default defineConfig({
	dialect: "sqlite",
	driver: "d1-http",
	migrations: { prefix: "timestamp" },
	strict: true,
	schema: "./db/schema.ts",
	out: "./db/migrations",
	dbCredentials: {
		accountId: CLOUDFLARE_ACCOUNT_ID,
		databaseId: CLOUDFLARE_DATABASE_ID,
		token: CLOUDFLARE_API_TOKEN,
	},
});
