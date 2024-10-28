import { index, layout, prefix, route } from "@react-router/dev/routes";

export const routes = [
	// API Routes
	...prefix("api", [
		route("files/:key", "./api/files.ts"),
		route("dev/purge", "./api/purge.tsx"),
	]),

	// Webhook Routes
	...prefix("webhooks", []),

	// Admin Routes
	route("admin", "./layouts/admin.tsx", [
		route("dashboard", "./views/admin/dashboard.tsx"),
	]),

	// Auth Routes
	layout("./layouts/auth.tsx", [
		route("logout", "./views/logout.tsx"),
		route("register", "./views/register.tsx"),
		route("login", "./views/login.tsx"),
	]),

	// Other Routes
	index("./views/home.tsx"),
	route("profile", "./views/profile.tsx"),

	// Catch-all Route
	route("*", "./views/catch-all.tsx"),
];
