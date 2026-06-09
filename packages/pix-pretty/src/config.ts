import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { BundledTheme } from "./types.js";

const DEFAULT_THEME: BundledTheme = "github-dark";

export function getDefaultAgentDir(): string | undefined {
	const home = process.env.HOME ?? "";
	return home ? join(home, ".pi/agent") : undefined;
}

function readThemeFromSettings(agentDir?: string): BundledTheme | undefined {
	const resolvedAgentDir = agentDir ?? getDefaultAgentDir();
	if (!resolvedAgentDir) return undefined;

	try {
		const settings = JSON.parse(
			readFileSync(join(resolvedAgentDir, "settings.json"), "utf8"),
		) as {
			theme?: unknown;
		};
		return typeof settings.theme === "string"
			? (settings.theme as BundledTheme)
			: undefined;
	} catch {
		return undefined;
	}
}

function resolvePrettyTheme(agentDir?: string): BundledTheme {
	return (
		(process.env.PRETTY_THEME as BundledTheme | undefined) ??
		readThemeFromSettings(agentDir) ??
		DEFAULT_THEME
	);
}

export let THEME: BundledTheme = resolvePrettyTheme();

export function setPrettyTheme(agentDir?: string): void {
	const resolvedTheme = resolvePrettyTheme(agentDir);
	if (resolvedTheme === THEME) return;
	THEME = resolvedTheme;
}

export function envInt(name: string, fallback: number): number {
	const v = Number.parseInt(process.env[name] ?? "", 10);
	return Number.isFinite(v) && v > 0 ? v : fallback;
}

export const MAX_HL_CHARS = envInt("PRETTY_MAX_HL_CHARS", 80_000);

export const MAX_PREVIEW_LINES = envInt("PRETTY_MAX_PREVIEW_LINES", 80);

export const CACHE_LIMIT = envInt("PRETTY_CACHE_LIMIT", 128);

// --- Diff rendering limits (edit/write tools) ---
export const MAX_RENDER_LINES = envInt("PRETTY_MAX_RENDER_LINES", 150);

// Word-level emphasis only when paired del/add lines are at least this similar.
export const WORD_DIFF_MIN_SIM = 0.15;

// ---------------------------------------------------------------------------
// ANSI
// ---------------------------------------------------------------------------
