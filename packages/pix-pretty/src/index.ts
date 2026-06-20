/**
 * pi-pretty — Pretty terminal output for pi built-in tools.
 *
 * Pure rendering library — no Pi lifecycle hooks or extensions.
 * UI features (paste chips, thinking blocks) live in pix-display.
 */

import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { registerFffCommands } from "./commands/fff.js";
import { getDefaultAgentDir, setPrettyTheme } from "./config.js";
import { fffState } from "./fff.js";
import { clearHighlightCache } from "./highlight.js";
import type { PiPrettyApi } from "./types.js";

export default function piPrettyExtension(pi: PiPrettyApi): void {
	// ── Theme init ──────────────────────────────────────────────────────
	setPrettyTheme(
		(() => {
			try {
				return getAgentDir?.() ?? getDefaultAgentDir();
			} catch {
				return getDefaultAgentDir();
			}
		})(),
	);
	clearHighlightCache();

	// ── FFF slash commands ──────────────────────────────────────────────
	// fffState is a module-level singleton shared with pix-grep/pix-find.
	// Commands become available once pix-grep initialises the finder.
	registerFffCommands(pi, fffState);
}

/**
 * piPrettyExtension still exports a default function for packages that
 * import it as an extension (pix-core activates it for theme + FFF).
 * UI extensions (paste-chips, thinking) moved to pix-display.
 */
