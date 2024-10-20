import { index, layout, route } from "@react-router/dev/routes";

export const routes = [
	index("./views/home.tsx"),
	route("/profile", "./views/profile.tsx"),

	// Auth Routes
	layout("./layouts/auth.tsx", [route("register", "./views/register.tsx")]),

	// API Routes
	route("/api/files/:key", "./api/files.ts"),
	route("/api/dev/purge", "./api/purge.tsx"),

	// Catch-all Route
	route("*", "./views/catch-all.tsx"),
];
