import { UsersRepository } from "app:repositories/users";
import type * as Route from "types:views/+types.home";
import { json } from "react-router";

export async function loader() {
	console.log("Users", await new UsersRepository().findAll());
	return json(null);
}

export default function Home(props: Route.ComponentProps) {
	return <h2>Home</h2>;
}
