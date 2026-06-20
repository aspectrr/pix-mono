/**
 * pix-display — Pi core extension: paste chip rendering + thinking block display.
 *
 * Entry point: activates both paste-chips and thinking extensions at
 * session start. In non-interactive modes (JSON/RPC) both are no-ops.
 *
 * Modules:
 *   paste-chips.ts   ChipEditor overlay, marker restyling, image path collapse
 *   thinking.ts      Leaked reasoning tag → native thinking content blocks
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import pasteChipsExtension from "./paste-chips.js";
import thinkingExtension from "./thinking.js";

export default function pixDisplayExtension(pi: ExtensionAPI): void {
	pasteChipsExtension(pi);
	thinkingExtension(pi);
}
