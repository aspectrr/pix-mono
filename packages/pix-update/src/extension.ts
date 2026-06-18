import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerUpdate from "./update.ts";

export default function (pi: ExtensionAPI): void {
	registerUpdate(pi);
}
