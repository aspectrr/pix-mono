import { basename, dirname } from "node:path";
import { truncateToWidth } from "@earendil-works/pi-tui";

import {
	BOLD,
	FG_BLUE,
	FG_DIM,
	FG_GREEN,
	FG_RED,
	FG_RULE,
	FG_YELLOW,
	RST,
} from "./ansi.js";
import { MAX_PREVIEW_LINES } from "./config.js";
import { hlBlock } from "./highlight.js";
import { dirIcon, fileIcon } from "./icons.js";
import { lang } from "./lang.js";
import { lnum, normalizeLineEndings, rule, termW } from "./utils.js";

/** Render syntax-highlighted file content with line numbers. */
export async function renderFileContent(
	content: string,
	filePath: string,
	offset = 1,
	maxLines = MAX_PREVIEW_LINES,
): Promise<string> {
	const normalizedContent = normalizeLineEndings(content);
	const lines = normalizedContent.split("\n");
	const total = lines.length;
	const show = lines.slice(0, maxLines);
	const lg = lang(filePath);
	const hl = await hlBlock(show.join("\n"), lg);

	const tw = termW();
	const startLine = offset;
	const endLine = startLine + show.length - 1;
	const nw = Math.max(3, String(endLine).length);
	const gw = nw + 3; // num + " │ "
	const cw = Math.max(1, tw - gw);

	const out: string[] = [];
	out.push(rule(tw));

	for (let i = 0; i < hl.length; i++) {
		const ln = startLine + i;
		const code = hl[i] ?? show[i] ?? "";
		const display = truncateToWidth(code, cw, `${FG_DIM}›`);
		out.push(`${lnum(ln, nw)} ${FG_RULE}│${RST} ${display}${RST}`);
	}

	out.push(rule(tw));
	if (total > maxLines) {
		out.push(
			`${FG_DIM}  … ${total - maxLines} more lines (${total} total)${RST}`,
		);
	}
	return out.join("\n");
}

/** Render bash output with colored exit code and stderr highlighting. */
export function renderBashOutput(
	text: string,
	exitCode: number | null,
): { summary: string; body: string } {
	const isOk = exitCode === 0;
	const statusFg = isOk ? FG_GREEN : FG_RED;
	const statusIcon = isOk ? "✓" : "✗";
	const codeStr =
		exitCode !== null
			? `${statusFg}${statusIcon} exit ${exitCode}${RST}`
			: `${FG_YELLOW}⚡ killed${RST}`;

	const lines = text.split("\n");
	const maxShow = MAX_PREVIEW_LINES;
	const show = lines.slice(0, maxShow);
	const remaining = lines.length - maxShow;

	let body = show.join("\n");
	if (remaining > 0) {
		body += `\n${FG_DIM}  … ${remaining} more lines${RST}`;
	}

	return { summary: codeStr, body };
}

/** Render ls output as a tree view with icons. */
export function renderTree(text: string, _basePath: string): string {
	const lines = text.trim().split("\n").filter(Boolean);
	if (!lines.length) return `${FG_DIM}(empty directory)${RST}`;

	const out: string[] = [];
	const total = lines.length;
	const show = lines.slice(0, MAX_PREVIEW_LINES);

	for (let i = 0; i < show.length; i++) {
		const entry = show[i].trim();
		const isLast = i === show.length - 1 && total <= MAX_PREVIEW_LINES;
		const prefix = isLast ? "└── " : "├── ";
		const connector = `${FG_RULE}${prefix}${RST}`;

		// Detect directories (entries ending with /)
		const isDir = entry.endsWith("/");
		const name = isDir ? entry.slice(0, -1) : entry;
		const icon = isDir ? dirIcon() : fileIcon(name);
		const fg = isDir ? FG_BLUE + BOLD : "";
		const reset = isDir ? RST : "";

		out.push(`${connector}${icon}${fg}${name}${reset}`);
	}

	if (total > MAX_PREVIEW_LINES) {
		out.push(
			`${FG_RULE}└── ${RST}${FG_DIM}… ${total - MAX_PREVIEW_LINES} more entries${RST}`,
		);
	}

	return out.join("\n");
}

/** Render find results grouped by directory with icons. */
export function renderFindResults(text: string): string {
	const lines = text.trim().split("\n").filter(Boolean);
	if (!lines.length) return `${FG_DIM}(no matches)${RST}`;

	// Group by directory
	const groups = new Map<string, string[]>();
	for (const line of lines) {
		const trimmed = line.trim();
		const dir = dirname(trimmed) || ".";
		const file = basename(trimmed);
		if (!groups.has(dir)) groups.set(dir, []);
		const bucket = groups.get(dir);
		if (bucket) bucket.push(file);
	}

	const out: string[] = [];
	let count = 0;

	for (const [dir, files] of groups) {
		if (count > 0) out.push(""); // blank line between groups
		out.push(`${dirIcon()}${FG_BLUE}${BOLD}${dir}/${RST}`);
		for (let i = 0; i < files.length; i++) {
			if (count >= MAX_PREVIEW_LINES) {
				out.push(`  ${FG_DIM}… ${lines.length - count} more files${RST}`);
				return out.join("\n");
			}
			const isLast = i === files.length - 1;
			const prefix = isLast ? "└── " : "├── ";
			const icon = fileIcon(files[i]);
			out.push(`  ${FG_RULE}${prefix}${RST}${icon}${files[i]}`);
			count++;
		}
	}

	return out.join("\n");
}

/** Render grep results with highlighted matches and line numbers. */
export async function renderGrepResults(
	text: string,
	pattern: string,
): Promise<string> {
	const lines = normalizeLineEndings(text).split("\n");
	if (!lines.length || (lines.length === 1 && !lines[0].trim()))
		return `${FG_DIM}(no matches)${RST}`;

	const out: string[] = [];
	let currentFile = "";
	let count = 0;

	// Try to build a regex for highlighting
	let re: RegExp | null = null;
	try {
		re = new RegExp(`(${pattern})`, "gi");
	} catch {
		// invalid regex — skip highlighting
	}

	for (const line of lines) {
		if (count >= MAX_PREVIEW_LINES) {
			out.push(`${FG_DIM}  … more matches${RST}`);
			break;
		}

		// ripgrep-style: "file:line:content" or "file-line-content" or just "file"
		const fileMatch = line.match(/^(.+?)[:-](\d+)[:-](.*)$/);
		if (fileMatch) {
			const [, file, lineNo, content] = fileMatch;
			if (file !== currentFile) {
				if (currentFile) out.push(""); // blank line between files
				const icon = fileIcon(file);
				out.push(`${icon}${FG_BLUE}${BOLD}${file}${RST}`);
				currentFile = file;
			}

			const nw = Math.max(3, lineNo.length);
			let display = content;
			if (re) {
				display = content.replace(re, `${RST}${FG_YELLOW}${BOLD}$1${RST}`);
			}
			out.push(
				`  ${lnum(Number(lineNo), nw)} ${FG_RULE}│${RST} ${display}${RST}`,
			);
			count++;
		} else if (line.trim() === "--") {
			// ripgrep separator
			out.push(`  ${FG_DIM}  ···${RST}`);
		} else if (line.trim()) {
			out.push(line);
			count++;
		}
	}

	return out.join("\n");
}

// ---------------------------------------------------------------------------
// FFF integration (optional) — Fast File Finder with frecency & SIMD search
//
// If @ff-labs/fff-node is installed, find/grep use FFF for speed + frecency.
// If not, falls back to wrapping SDK tools (current behavior).
// ---------------------------------------------------------------------------
