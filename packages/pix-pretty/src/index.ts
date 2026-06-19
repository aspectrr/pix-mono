/**
 * pi-pretty — Pretty terminal output for pi built-in tools.
 *
 * Entry point: initialises theme + highlight cache, registers FFF slash
 * commands (/fff-rescan etc.). Individual tool renderers live in the
 * standalone pix-{read,bash,ls,find,grep,edit,write} packages — each
 * self-registers via its own pi extension entry point.
 *
 * Modules:
 *   types.ts          shared interfaces/types
 *   config.ts         theme + thresholds
 *   ansi.ts           ANSI codes, low-contrast fix
 *   utils.ts          helpers + renderToolError
 *   lang.ts           language detection
 *   icons.ts          Nerd Font file-type icons
 *   highlight.ts      cli-highlight engine + ANSI cache
 *   renderers.ts      renderFileContent/Bash/Tree/Find/Grep
 *   fff.ts            Fast File Finder + cursor store + module singleton
 *   diff.ts           unified diff parser
 *   diff-render.ts    split/word-level diff renderer
 *   resize.ts         terminal resize invalidation registry
 *   tools/            per-tool registrar helpers (context type)
 *   commands/         slash command registrars (fff)
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
