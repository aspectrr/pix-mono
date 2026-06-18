import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerCapabilityNudge from "./capability.ts";
import registerToolsNudge from "./tools.ts";

export default function (pi: ExtensionAPI): void {
	registerToolsNudge(pi);
	registerCapabilityNudge(pi);
}
