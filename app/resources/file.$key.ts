import { fs } from "edgekitjs";
import type { Route } from "./+types/file.$key";

export function loader({ params }: Route.LoaderArgs) {
	return fs().serve(params.key);
}
