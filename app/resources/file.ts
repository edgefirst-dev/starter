import type * as Route from "types:api/+types.files";
import { fs } from "edgekitjs";

export function loader({ params }: Route.LoaderArgs) {
	return fs().serve(params.key);
}
