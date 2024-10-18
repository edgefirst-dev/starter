import { UsersRepository } from "app:repositories.server/users";
import type * as Route from "types:views/+types.home";
import { json } from "react-router";

export async function loader() {
	let users = await new UsersRepository().findAll();
	return json({ count: users.length });
}

export default function Home(props: Route.ComponentProps) {
	return <h2>Home</h2>;
}
