import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerPixSubagent from "./index.ts";
import { once } from "./once.ts";

export default function pixSubagentExtension(pi: ExtensionAPI): void {
	once(pi, "pix-subagent", () => {
		registerPixSubagent(pi);
	});
}
