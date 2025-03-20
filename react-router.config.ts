import type { Config } from "@react-router/dev/config";
import "react-router";

declare module "react-router" {
	interface Future {
		unstable_middleware: false;
	}
}

export default {
	// Config options...
	// Server-side render by default, to enable SPA mode set this to `false`
	ssr: true,
	future: {
		unstable_middleware: false,
		unstable_optimizeDeps: true,
		unstable_splitRouteModules: true,
		unstable_viteEnvironmentApi: true,
	},
} satisfies Config;
