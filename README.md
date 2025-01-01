# Edge-first Starter Kit

A full-stack starter kit for Edge-first applications built with React on top of Cloudflare Developer Platform.

> [!IMPORTANT]
> This is still in development, the authentication code included works but is not ready or complete, however app works just fine ignoring that.

## Features

- [x] Deploy to **[Cloudflare Workers](https://workers.cloudflare.com/)**
- [x] Test and manage packages with **[Bun](https://bun.sh/docs/cli/test)**
- [x] Styles with **[Tailwind](https://tailwindcss.com/)**
- [x] Code Quality (lint and format) checker with **[Biome](https://biomejs.dev)**
- [x] CI with **[GH Actions](https://github.com/features/actions)**
- [x] Router with **[React Router](https://reactrouter.com/dev)**
- [x] Database with **[Cloudflare D1](https://developers.cloudflare.com/d1/)**
- [x] Query builder and DB migrations with **[Drizzle](https://orm.drizzle.team)**
- [x] Queues with **[Cloudflare Queues](https://developers.cloudflare.com/queues/)**
- [x] Scheduled tasks with **[Cloudflare Workers Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)**
- [x] KV storage and caching with **[Cloudflare Workers KV](https://developers.cloudflare.com/kv/)**
- [x] File storage with **[Cloudflare R2](https://developers.cloudflare.com/r2/)**
- [x] Run AI models with **[Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)**
- [x] Use Puppeteer with **[Cloudflare Browser Rendering](https://developers.cloudflare.com/browser-rendering/)**
- [x] User profile backfilling with **[Gravatar API](https://docs.gravatar.com/)**
- [x] Prevent email spam with **[Verifier](https://verifier.meetchopra.com)**
- [x] Secure your users with **[HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)**
- [ ] Authentication and authorization WIP
- More to come...

## Getting Started

Create a new React application using the Edge-first Starter Kit:

```sh
bun create edgefirst-dev/starter my-app
cd my-app
bun run setup
```

The `setup` script will ask for your project name, and other information to configure the project locally and on Cloudflare.

Check the [setup docs](./docs/setup.md) for more information.

## Author

- [Sergio Xalambrí](https://sergiodxa.com)
