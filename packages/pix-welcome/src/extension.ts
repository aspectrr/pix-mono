import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerWelcome from "./welcome.ts";

export default function (pi: ExtensionAPI): void {
	registerWelcome(pi);
}
