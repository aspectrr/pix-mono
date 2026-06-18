/**
 * prompts.ts — unconditional system-prompt injection
 *
 * Injects structured context into every agent turn via `before_agent_start`.
 * Sources (injected in order):
 *   1. Own bundled AGENT.md — the pix agent operating spec baseline.
 *   2. Repo CWD files — AGENTS.md, CLAUDE.md, GEMINI.md, .cursorrules,
 *      .windsurfrules (repo directives; extend/override the baseline).
 *
 * Each file is wrapped in a labelled XML tag so the model knows provenance.
 * Injection is idempotent per source: a file whose tag is already present in
 * the system prompt is silently skipped (prevents double-injection on retry).
 */

import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/** Repo-root filenames scanned for per-project directives. */
const REPO_DIRECTIVE_FILES = [
	"AGENTS.md",
	"CLAUDE.md",
	"GEMINI.md",
	".cursorrules",
	".windsurfrules",
] as const;

interface PromptSource {
	/** Unique tag name — used for idempotency check. */
	tag: string;
	/** Absolute path to the file. */
	path: string;
}

/** Resolve the absolute path to AGENT.md bundled inside this package. */
function resolveOwnAgentMd(): string | null {
	try {
		const require = createRequire(import.meta.url);
		const pkgJson = require.resolve("@xynogen/pix-prompts/package.json");
		return resolve(pkgJson, "..", "AGENT.md");
	} catch {
		// Fallback: resolve relative to this file's location at runtime.
		return resolve(new URL(".", import.meta.url).pathname, "..", "AGENT.md");
	}
}

/** Read a file, returning null on any error. */
function safeRead(p: string): string | null {
	try {
		return readFileSync(p, "utf-8");
	} catch {
		return null;
	}
}

/** Wrap file content in a labelled XML tag for provenance + idempotency. */
function wrap(tag: string, content: string): string {
	return `<${tag}>\n${content}\n</${tag}>`;
}

export default function registerPrompts(pi: ExtensionAPI): void {
	// Resolve own AGENT.md once at load time (path is static).
	const ownAgentMdPath = resolveOwnAgentMd();

	pi.on("before_agent_start", async (event) => {
		const existing = event.systemPrompt ?? "";
		const cwd = process.cwd();

		const sources: PromptSource[] = [];

		// 1. Own AGENT.md
		if (ownAgentMdPath) {
			sources.push({ tag: "pix-agent-sop", path: ownAgentMdPath });
		}

		// 2. Repo directive files (root only)
		for (const filename of REPO_DIRECTIVE_FILES) {
			const p = join(cwd, filename);
			if (existsSync(p)) {
				// tag = "pix-prompts-<filename>" with dots/leading-dot stripped
				const tag = `pix-prompts-${filename.replace(/^\./, "").replace(/\./g, "-").toLowerCase()}`;
				sources.push({ tag, path: p });
			}
		}

		// Inject each source that isn't already in the system prompt.
		let prompt = existing;
		for (const { tag, path } of sources) {
			if (prompt.includes(`<${tag}>`)) continue; // already injected
			const content = safeRead(path);
			if (!content) continue;
			prompt = prompt
				? `${prompt}\n\n${wrap(tag, content)}`
				: wrap(tag, content);
		}

		if (prompt === existing) return; // nothing new to inject
		return { systemPrompt: prompt };
	});
}
