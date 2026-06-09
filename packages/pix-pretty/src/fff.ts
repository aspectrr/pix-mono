import { spawn } from "node:child_process";
import { join } from "node:path";

import type { GrepCursor, GrepMatch } from "@ff-labs/fff-node";

import type {
	ConstraintParseResult,
	FffBackedFinder,
	MultiGrepRipgrepFallbackParams,
	MultiGrepRipgrepFallbackResult,
	OptionalFffModule,
} from "./types.js";

export interface FffState {
	module: OptionalFffModule | null;
	finder: FffBackedFinder | null;
	partialIndex: boolean;
	dbDir: string | null;
}

export const fffState: FffState = {
	module: null,
	finder: null,
	partialIndex: false,
	dbDir: null,
};

export const FFF_SCAN_TIMEOUT = 15_000;

export function getPiPrettyFffDir(_agentDir: string): string {
	// FFF state lives under the XDG cache dir, not the agent dir.
	// Override with PRETTY_FFF_DIR; otherwise ~/.cache/pi/fff
	// ($XDG_CACHE_HOME/pi/fff when XDG_CACHE_HOME is set).
	const override = process.env.PRETTY_FFF_DIR?.trim();
	if (override) return override;
	const home = process.env.HOME ?? "";
	const cacheHome = process.env.XDG_CACHE_HOME?.trim() || join(home, ".cache");
	return join(cacheHome, "pi", "fff");
}

export async function fffEnsureFinder(
	cwd: string,
): Promise<FffBackedFinder | null> {
	if (fffState.finder && !fffState.finder.isDestroyed) return fffState.finder;
	if (!fffState.module || !fffState.dbDir) return null;

	const result = fffState.module.FileFinder.create({
		basePath: cwd,
		frecencyDbPath: join(fffState.dbDir, "frecency.mdb"),
		historyDbPath: join(fffState.dbDir, "history.mdb"),
		aiMode: true,
	});

	if (!result.ok) throw new Error(`FFF init failed: ${result.error}`);

	fffState.finder = result.value;
	const scan = await fffState.finder.waitForScan(FFF_SCAN_TIMEOUT);
	fffState.partialIndex = scan.ok && !scan.value;

	return fffState.finder;
}

export function fffDestroy(): void {
	if (fffState.finder && !fffState.finder.isDestroyed) {
		fffState.finder.destroy();
		fffState.finder = null;
	}
	fffState.partialIndex = false;
}

// ---------------------------------------------------------------------------
// FFF helpers (CursorStore, grep formatting)
// ---------------------------------------------------------------------------

function sanitizeGrepRecordContent(text: string): string {
	let content = text;
	if (content.endsWith("\r\n")) content = content.slice(0, -2);
	else if (content.endsWith("\r") || content.endsWith("\n"))
		content = content.slice(0, -1);

	return content
		.replace(/\r\n/g, "\\n")
		.replace(/\r/g, "\\r")
		.replace(/\n/g, "\\n");
}

function truncateGrepRecordContent(text: string): string {
	const content = sanitizeGrepRecordContent(text);
	return content.length > 500 ? `${content.slice(0, 500)}...` : content;
}

/**
 * Store for FFF grep pagination cursors.
 * Evicts oldest entry when exceeding maxSize.
 */
export class CursorStore {
	private cursors = new Map<string, GrepCursor>();
	private counter = 0;
	private maxSize: number;

	constructor(maxSize = 200) {
		this.maxSize = maxSize;
	}

	store(cursor: GrepCursor): string {
		const id = `fff_c${++this.counter}`;
		this.cursors.set(id, cursor);
		if (this.cursors.size > this.maxSize) {
			const first = this.cursors.keys().next().value;
			if (first) this.cursors.delete(first);
		}
		return id;
	}

	get(id: string): GrepCursor | undefined {
		return this.cursors.get(id);
	}

	get size(): number {
		return this.cursors.size;
	}
}

/**
 * Convert FFF GrepResult items to ripgrep-style "file:line:content" text.
 * This ensures pi-pretty's renderGrepResults works unchanged.
 */
export function fffFormatGrepText(items: GrepMatch[], limit: number): string {
	const capped = items.slice(0, limit);
	if (!capped.length) return "No matches found";

	const lines: string[] = [];
	let currentFile = "";

	for (const match of capped) {
		if (match.relativePath !== currentFile) {
			if (currentFile) lines.push("");
			currentFile = match.relativePath;
		}
		if (match.contextBefore?.length) {
			const startLine = match.lineNumber - match.contextBefore.length;
			for (let i = 0; i < match.contextBefore.length; i++) {
				lines.push(
					`${match.relativePath}-${startLine + i}-${truncateGrepRecordContent(match.contextBefore[i] ?? "")}`,
				);
			}
		}
		lines.push(
			`${match.relativePath}:${match.lineNumber}:${truncateGrepRecordContent(match.lineContent)}`,
		);
		if (match.contextAfter?.length) {
			const startLine = match.lineNumber + 1;
			for (let i = 0; i < match.contextAfter.length; i++) {
				lines.push(
					`${match.relativePath}-${startLine + i}-${truncateGrepRecordContent(match.contextAfter[i] ?? "")}`,
				);
			}
		}
	}

	return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Multi-grep ripgrep fallback
// ---------------------------------------------------------------------------

const GLOB_META_RE = /[*?[{]/;

function trimSlashes(value: string): string {
	return value.replace(/^\/+/, "").replace(/\/+$/, "");
}

function normalizeConstraintPath(value: string): string {
	let normalized = value.replace(/\\/g, "/").trim();
	while (normalized.startsWith("./")) normalized = normalized.slice(2);
	return normalized;
}

function tokenizeConstraints(constraints: string): ConstraintParseResult {
	const tokens: string[] = [];
	let current = "";
	let quote: '"' | "'" | null = null;

	for (let i = 0; i < constraints.length; i++) {
		const char = constraints[i];
		if (quote) {
			if (char === quote) quote = null;
			else current += char;
			continue;
		}

		if (char === '"' || char === "'") {
			quote = char;
			continue;
		}

		if (/\s/.test(char)) {
			if (current) {
				tokens.push(current);
				current = "";
			}
			continue;
		}

		current += char;
	}

	if (quote) return { ok: false, error: "unterminated quoted constraint" };
	if (current) tokens.push(current);

	return { ok: true, globs: [], tokens };
}

function tokenToRipgrepGlob(
	token: string,
): { ok: true; glob: string } | { ok: false; error: string } {
	let negated = false;
	let body = token;

	if (body.startsWith("!")) {
		negated = true;
		body = body.slice(1);
	}

	body = normalizeConstraintPath(body);
	if (!body) return { ok: false, error: `empty constraint token: ${token}` };
	if (body.includes("\0"))
		return {
			ok: false,
			error: `invalid NUL byte in constraint token: ${token}`,
		};

	let glob: string;
	if (body.endsWith("/")) {
		const dir = trimSlashes(body);
		if (!dir)
			return { ok: false, error: `empty directory constraint: ${token}` };
		glob = `**/${dir}/**`;
	} else if (GLOB_META_RE.test(body) || body.includes("/")) {
		glob = body.replace(/^\/+/, "");
	} else if (body.includes(".")) {
		glob = `**/${body}`;
	} else {
		glob = `**/${body}/**`;
	}

	return { ok: true, glob: negated ? `!${glob}` : glob };
}

export function parseMultiGrepConstraints(
	constraints: string | undefined,
): ConstraintParseResult {
	const trimmed = constraints?.trim();
	if (!trimmed) return { ok: true, globs: [], tokens: [] };

	const tokenized = tokenizeConstraints(trimmed);
	if (!tokenized.ok) return tokenized;

	const globs: string[] = [];
	for (const token of tokenized.tokens) {
		const parsed = tokenToRipgrepGlob(token);
		if (!parsed.ok) return parsed;
		globs.push(parsed.glob);
	}

	return { ok: true, globs, tokens: tokenized.tokens };
}

function isRipgrepMatchLine(line: string): boolean {
	return /^.+?:\d+:/.test(line);
}

function buildRipgrepArgs(
	params: MultiGrepRipgrepFallbackParams,
	globs: string[],
): string[] {
	const args = [
		"--line-number",
		"--with-filename",
		"--color=never",
		"--hidden",
		"--fixed-strings",
	];

	if (params.ignoreCase) args.push("--ignore-case");
	if (params.context && params.context > 0)
		args.push("--context", String(params.context));

	for (const glob of globs) args.push("--glob", glob);
	for (const pattern of params.patterns) args.push("-e", pattern);

	const searchPath = params.path?.trim();
	if (searchPath) args.push("--", searchPath);

	return args;
}

export function getMultiGrepRipgrepArgs(
	params: MultiGrepRipgrepFallbackParams,
): ConstraintParseResult & { args?: string[] } {
	const parsed = parseMultiGrepConstraints(params.constraints);
	if (!parsed.ok) return parsed;
	return { ...parsed, args: buildRipgrepArgs(params, parsed.globs) };
}

export async function runMultiGrepRipgrepFallback(
	params: MultiGrepRipgrepFallbackParams,
): Promise<MultiGrepRipgrepFallbackResult> {
	const parsed = parseMultiGrepConstraints(params.constraints);
	if (!parsed.ok) throw new Error(`unsupported constraints: ${parsed.error}`);

	const args = buildRipgrepArgs(params, parsed.globs);

	return new Promise((resolve, reject) => {
		if (params.signal?.aborted) {
			reject(new Error("Operation aborted"));
			return;
		}

		const child = spawn("rg", args, {
			cwd: params.cwd,
			stdio: ["ignore", "pipe", "pipe"],
		});
		const outputLines: string[] = [];
		let stderr = "";
		let buffer = "";
		let matchCount = 0;
		let limitReached = false;
		let killedForLimit = false;
		let settled = false;

		const settle = (fn: () => void): void => {
			if (settled) return;
			settled = true;
			fn();
		};

		const stopChild = (dueToLimit = false): void => {
			if (!child.killed) {
				killedForLimit = dueToLimit;
				child.kill();
			}
		};

		const onAbort = (): void => stopChild(false);
		params.signal?.addEventListener("abort", onAbort, { once: true });

		const cleanup = (): void => {
			params.signal?.removeEventListener("abort", onAbort);
		};

		const handleLine = (line: string): void => {
			if (limitReached) return;
			outputLines.push(line);
			if (isRipgrepMatchLine(line)) {
				matchCount++;
				if (matchCount >= params.limit) {
					limitReached = true;
					stopChild(true);
				}
			}
		};

		child.stdout?.on("data", (chunk: Buffer) => {
			buffer += chunk.toString("utf8");
			let newlineIndex = buffer.indexOf("\n");
			while (newlineIndex >= 0) {
				const line = buffer.slice(0, newlineIndex).replace(/\r$/, "");
				buffer = buffer.slice(newlineIndex + 1);
				handleLine(line);
				newlineIndex = buffer.indexOf("\n");
			}
		});

		child.stderr?.on("data", (chunk: Buffer) => {
			stderr += chunk.toString("utf8");
		});

		child.on("error", (error: NodeJS.ErrnoException) => {
			cleanup();
			const message =
				error.code === "ENOENT"
					? "ripgrep (rg) is not available"
					: `Failed to run ripgrep: ${error.message}`;
			settle(() => reject(new Error(message)));
		});

		child.on("close", (code) => {
			cleanup();

			if (params.signal?.aborted) {
				settle(() => reject(new Error("Operation aborted")));
				return;
			}

			if (buffer && !limitReached) handleLine(buffer.replace(/\r$/, ""));

			if (!killedForLimit && code !== 0 && code !== 1) {
				const message = stderr.trim() || `ripgrep exited with code ${code}`;
				settle(() => reject(new Error(message)));
				return;
			}

			settle(() =>
				resolve({
					text: outputLines.length
						? outputLines.join("\n")
						: "No matches found",
					matchCount,
					limitReached,
				}),
			);
		});
	});
}
