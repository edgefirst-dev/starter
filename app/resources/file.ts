import type { Route } from "types:resources/+types.file";
import { fs } from "edgekitjs";

export function loader({ params }: Route.LoaderArgs) {
	return fs().serve(params.key);
}
