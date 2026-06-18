/**
 * /diff — summarise unstaged git diff: what changed, why, and impact.
 *
 * The agent runs `git status` + `git diff`, then replies with:
 *   1. One-line TL;DR of the overall change
 *   2. Per-file summary: what changed and why (not just counts)
 *   3. Brief impact note (behaviour change, bug fix, refactor, etc.)
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const DIFF_PROMPT = `Run \`git status\` and \`git diff\` to inspect all unstaged changes, then respond with:

**TL;DR** — one sentence: what is the overall change.

**Per-file breakdown** — for each changed file:
- Filename (+lines/-lines)
- What changed (describe the actual code change)
- Why it changed (intent / reason behind the edit)

**Impact** — one sentence: what effect does this have on behaviour, tests, or users.

Rules: base everything on the actual diff content. Use \`git diff --stat\` for line counts. Skip staged-only changes. Be concise — each file entry should fit in 1-2 lines.`;

export default function (pi: ExtensionAPI) {
	pi.registerCommand("diff", {
		description:
			"Summarise unstaged diff: TL;DR, per-file what/why/counts, impact",
		handler: async (_args, ctx) => {
			if (!ctx.isIdle()) {
				pi.sendUserMessage(DIFF_PROMPT, { deliverAs: "followUp" });
				ctx.ui.notify("Queued /diff after the current turn finishes.", "info");
				return;
			}
			pi.sendUserMessage(DIFF_PROMPT);
		},
	});
}
