import type * as Route from "types:api/+types.files";
import { fs } from "@edgefirst-dev/core";

export function loader({ params }: Route.LoaderArgs) {
	return fs().serve(params.key);
}
