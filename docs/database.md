# Database

We use Cloudflare D1, locally this uses SQLite persisted to a file inside `.wrangler/state/v3/d1`.

## Migrations

To run any pending migration against your local database you have to use `bun run db:migrate:locale <db-name>` with your database name.

To generate any new migration file you need to do changes to the `db/schema.ts` file, then run the same command as above and this will generate the migration file in the `db/migrations` folder, and run them.

## Seed data

To define the seed data we use the file `db/seed.sql`, we use plain SQL as this is simpler, faster and more reliable than using an ORM.

You can run this seed against your local DB using `bun run db:seed <db-name>`, this will run the seed against the database with the name you provide.

The default seed data comes with a user with the email `test@edgefirst.dev` and password `password`, with role `root` and being the owner of its own team.

Feel free to change the email and password hash to your own values in the `db/seed.sql` file.

If you already ran them and want to reset the seed data you have to drop the database.

## Drop database

You can drop the local database using `bun run db:drop`, this will delete any local state associated to Cloudflare, which includes the local D1, KV, R2 and cache.
