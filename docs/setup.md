# Setup

## Environment Variables

Create a `.dev.vars` file with the following content:

```txt
APP_ENV="development"

CLOUDFLARE_ACCOUNT_ID=""
CLOUDFLARE_DATABASE_ID=""
CLOUDFLARE_API_TOKEN=""

GRAVATAR_API_TOKEN=""

VERIFIER_API_KEY=""
```

Replace the empty strings with the values of your Cloudflare account, database and API token, Gravatar API token and Verifier API key.

You can get a new Verifier API key at [verifier.meetchopra.com](https://verifier.meetchopra.com) completely free.

You can get a new Gravatar API token at [gravatar.com/developers](https://gravatar.com/developers/applications) completely free.

> [!TIP]
> On your Cloudflare Workers environment you will only need `GRAVATAR_API_TOKEN` and `VERIFIER_API_KEY` environment variables.

## The Cloudflare API token should have the following permissions:

- Workers AI:Edit
- D1:Edit
- Workers R2 Storage:Edit
- Workers KV Storage:Edit
- Workers Scripts:Edit

## Create required bindings

You will need to create the following bindings:

```sh
bunx wrangler d1 create <db-name>
bunx wrangler kv namespace create <kv-name>
bunx wrangler r2 bucket create <r2-name>
bunx wrangler queues create
```

Replace the values between `<>` with your desired names, then update the IDs in your wrangler.toml file for the D1 and KV, and the name for the D1 and R2 and queue.

> [!IMPORTANT]
> Don't change the binding names, they must be DB, KV and FS as that's what EdgeKit.js expects.

## Run migrations

You will need to run the database migrations, you can do it with

```bash
bun run db:migrate:local db-name
```

Replace `db-name` with your database name configured in `wrangler.toml`.

## Setup GitHub Action Secrets

To deploy using the GitHub Action workflow you will need to setup the following secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_DATABASE_NAME`
- `CLOUDFLARE_API_TOKEN`

These can be the sames that you used in your `.dev.vars` file.
