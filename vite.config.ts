import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import { defineConfig } from "vite";
import { denyImports } from "vite-env-only";
import { cjsInterop } from "vite-plugin-cjs-interop";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	build: { cssMinify: process.env.NODE_ENV === "production", sourcemap: true },
	server: { port: 3000 },
	plugins: [
		tsconfigPaths(),
		cjsInterop({ dependencies: ["bcrypt"] }),
		denyImports({
			client: {
				specifiers: [/^node:/, "edgekitjs"],
				files: [
					"**/.server/*",
					"**/*.server/*",
					"**/*.server.*",
					"app:repositories/**/*",
					"app:clients/**/*",
					"app:entities/**/*",
					"app:servies.server/**/*",
				],
			},
			server: {
				files: ["**/.client/*", "**/*.client.*"],
			},
		}),
		cloudflareDevProxy(),
		reactRouter(),
	],
});
