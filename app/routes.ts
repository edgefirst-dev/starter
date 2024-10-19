import { index, route } from "@react-router/dev/routes";

export const routes = [
	index("./views/home.tsx"),
	route("*", "./views/catch-all.tsx"),
];
