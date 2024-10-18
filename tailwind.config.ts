import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

export default {
	content: ["./app/**/*.{ts,tsx}"],
	darkMode: "media",
	theme: {
		colors: {
			// Special colors
			transparent: colors.transparent,
			inherit: colors.inherit,
			current: colors.current,
			// Use the inline color to set the bg, border or foreground color based on data that can come from the server
			inline: "var(--color-inline)",
			// Black & White
			black: colors.black,
			white: colors.white,
			// Color palette
			accent: colors.green,
			neutral: colors.neutral,
			success: colors.green,
			warning: colors.amber,
			danger: colors.red,
			info: colors.cyan,
		},
		extend: {},
	},
	plugins: [],
} satisfies Config;
