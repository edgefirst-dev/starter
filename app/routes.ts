import { index, layout, prefix, route } from "@react-router/dev/routes";

export default [
	// Resources
	route("files/:key", "./resources/file.ts"),

	// API Routes
	...prefix("api", []),

	// Webhook Routes
	...prefix("webhooks", []),

	// Views
	route("profile", "./views/profile.tsx"),

	// Landing Routes
	layout("./views/layouts/landings.tsx", [index("./views/landings/home.tsx")]),

	// Admin Routes
	route("admin", "./views/layouts/admin.tsx", [
		route("dashboard", "./views/admin/dashboard.tsx"),
		...prefix("dev", [route("purge", "./views/admin/purge.tsx")]),
	]),

	// Auth Routes
	layout("./views/layouts/auth.tsx", [
		route("logout", "./views/auth/logout.tsx"),
		route("register", "./views/auth/register.tsx"),
		route("login", "./views/auth/login.tsx"),
		route("recover", "./views/auth/recover.tsx"),
	]),

	// Catch-all Route
	route("*", "./views/catch-all.tsx"),
];
