import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerClear from "./clear.ts";
import registerDiff from "./diff.ts";

export default function (pi: ExtensionAPI): void {
	registerDiff(pi);
	registerClear(pi);
}
