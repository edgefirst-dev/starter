import { UsersRepository } from "app:repositories/users";
import type * as Route from "types:views/+types.home";
import { json } from "react-router";

export async function loader() {
	return json(null);
}

export default function Home(props: Route.ComponentProps) {
	return <h2>Home</h2>;
}
