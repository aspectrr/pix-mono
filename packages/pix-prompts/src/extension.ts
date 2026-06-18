import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerPrompts from "./prompts.ts";

export default function (pi: ExtensionAPI): void {
	registerPrompts(pi);
}
