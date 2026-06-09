/**
 * pix-optimizer — token-optimization suite for Pi Coding Agent.
 *
 * Three tools, combined into one extension + one command:
 *   - caveman: terse-output system prompt
 *   - rtk:     prefixes shell commands with `rtk` + injects RTK prompt
 *   - toon:    jq + TOON guidance for dense JSON (+ bundled skill)
 *
 * They share ONE status-bar cell (⛏ ⚔ ✂, only enabled tools shown) and ONE
 * command (/opt <tool> [args]). index.ts wires lifecycle hooks via each
 * module, then registers the merged command from their handles.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { caveman } from "./caveman.ts";
import { rtk } from "./rtk.ts";
import { json } from "./json.ts";
import { OptimizerStatus, type OptimizerHandle, type OptimizerTool } from "./status.ts";
import { registerOptCommand } from "./opt.ts";

export default function optimizer(pi: ExtensionAPI) {
	const status = new OptimizerStatus();

	// Each module registers its own lifecycle hooks and returns a handle the
	// merged /opt command dispatches to.
	const handles: Record<OptimizerTool, OptimizerHandle> = {
		caveman: caveman(pi, status),
		rtk: rtk(pi, status),
		toon: json(pi, status),
	};

	registerOptCommand(pi, handles);
}
