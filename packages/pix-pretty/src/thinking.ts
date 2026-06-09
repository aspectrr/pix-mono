/**
 * Render leaked reasoning tags as styled, visually distinct blocks.
 *
 * Some openai-compatible providers leak raw <think>/<thinking> tags into the
 * visible assistant `content[].text` (the real reasoning travels the proper
 * `reasoning_content` channel). Instead of stripping them, we render them
 * with clear visual styling so they're useful for debugging but don't
 * interfere with the actual response.
 *
 * Approach:
 *   - Do nothing during streaming (no live mutation, no polling, no races).
 *   - On `message_end`, extract and reformat every reasoning block with
 *     visual markers, then return the styled message via the supported
 *     replacement channel.
 *
 * `content[].text` is MARKDOWN rendered by pi's TUI Markdown component.
 * The TUI does NOT parse HTML — <details>/<summary> would render as literal
 * junk text. We use a Markdown BLOCKQUOTE instead, which the TUI renders
 * natively via the `mdQuote`/`mdQuoteBorder` theme tokens.
 *
 * To add a new tag variant, append to TAG_NAMES below.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// Reasoning tag names to render. Add new variants here.
const TAG_NAMES = ["think", "thinking"] as const;
const TAG_ALT = TAG_NAMES.join("|");

// Closed block: <think>...</think>
const CLOSED_BLOCK_RE = new RegExp(`<(${TAG_ALT})>([\\s\\S]*?)<\\/\\1>`, "gi");
// Dangling open block with no close (stream cut off, or close never emitted)
const OPEN_TAIL_RE = new RegExp(`<(${TAG_ALT})>([\\s\\S]*)$`, "i");
// Any orphan tags left over.
const ORPHAN_TAG_RE = new RegExp(`<\\/?(${TAG_ALT})>`, "gi");

interface TextBlock {
	type: "text";
	text: string;
}
type Block = TextBlock | { type: string; [k: string]: unknown };
interface Msg {
	role?: string;
	content?: Block[];
}

// Render a reasoning body as a markdown blockquote.
function asQuote(body: string, _label: string): string {
	const lines = body.split("\n");
	const quoted = lines.map((line) => `> ${line}`).join("\n");
	return `\n\n${quoted}\n\n`;
}

function renderThinking(text: string): string {
	// Replace closed blocks with a clearly-marked blockquote
	text = text.replace(CLOSED_BLOCK_RE, (_match, _tag, content) => {
		const trimmed = content.trim();
		if (!trimmed) return "";
		return asQuote(trimmed, "⚙ Reasoning");
	});

	// Replace dangling open blocks (stream cut off before close tag)
	text = text.replace(OPEN_TAIL_RE, (_match, _tag, content) => {
		const trimmed = content.trim();
		if (!trimmed) return "";
		return asQuote(trimmed, "⚙ Reasoning (incomplete)");
	});

	// Clean up any orphan tags
	text = text.replace(ORPHAN_TAG_RE, "");

	// Clean up excessive newlines
	return text.replace(/\n{4,}/g, "\n\n\n").replace(/^\s+/, "");
}

// Export for testing
export { renderThinking };

export default function thinkingExtension(pi: ExtensionAPI) {
	pi.on("message_end", (event) => {
		const msg = (event as { message?: Msg }).message;
		if (!msg || msg.role !== "assistant" || !Array.isArray(msg.content)) return;

		let changed = false;
		for (const block of msg.content) {
			if (block.type !== "text") continue;
			const tb = block as TextBlock;
			if (typeof tb.text !== "string") continue;
			if (!TAG_NAMES.some((t) => tb.text.includes(`<${t}`))) continue;
			const rendered = renderThinking(tb.text);
			if (rendered !== tb.text) {
				tb.text = rendered;
				changed = true;
			}
		}

		// Return the replacement so the styled message is what gets persisted.
		if (changed) return { message: msg as unknown as never };
	});
}
