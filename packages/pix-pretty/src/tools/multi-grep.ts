import type {
	ExtensionContext,
	GrepToolInput,
	ToolRenderResultOptions,
} from "@earendil-works/pi-coding-agent";

import { FG_DIM, RST } from "../ansi.js";
import { fffFormatGrepText } from "../fff.js";
import { renderGrepResults } from "../renderers.js";
import type {
	GrepResultDetails,
	MultiGrepParams,
	MultiGrepRenderState,
	PiPrettyApi,
	RenderContextLike,
	ThemeLike,
	ToolFactory,
	ToolResultLike,
} from "../types.js";
import {
	appendNotices,
	buildLiteralAlternationPattern,
	countRipgrepMatches,
	getConstraintBackedPath,
	getErrorMessage,
	getTextContent,
	isTextContent,
	makeTextResult,
	normalizeLineEndings,
	shouldIgnoreCaseForPatterns,
	termW,
	trimToUndefined,
} from "../utils.js";
import type { ToolContext } from "./context.js";

export function registerMultiGrepTool(
	pi: PiPrettyApi,
	createGrepTool: ToolFactory<GrepToolInput> | null,
	ctx: ToolContext,
): void {
	const {
		cwd,
		sp,
		TextComponent,
		fffState,
		cursorStore,
		multiGrepRipgrepFallback,
	} = ctx;
	const multiGrepFallback = createGrepTool ? createGrepTool(cwd) : null;

	pi.registerTool({
		name: "multi_grep",
		label: "multi_grep",
		renderShell: "self",
		description: [
			"Search file contents for lines matching ANY of multiple patterns (OR logic).",
			"Uses SIMD-accelerated Aho-Corasick multi-pattern matching when FFF is available.",
			"Falls back to ripgrep while preserving literal OR semantics and file constraints when needed.",
			"Patterns are literal text — never escape special characters.",
			"Use path to scope a directory/file and constraints for file filtering ('*.rs', 'src/', '!test/').",
		].join(" "),
		promptSnippet:
			"Multi-pattern OR search across file contents (FFF-accelerated with grep fallback)",
		promptGuidelines: [
			"Use multi_grep when you need to find multiple identifiers at once (OR logic).",
			"Include all naming conventions: snake_case, PascalCase, camelCase variants.",
			"Patterns are literal text. Never escape special characters.",
			"Use path to scope a directory or file when you need fresh on-disk results.",
			"Use the constraints parameter for additional file filtering, not inside patterns.",
		],

		parameters: {
			type: "object",
			properties: {
				patterns: {
					type: "array",
					items: { type: "string" },
					description:
						"Patterns to search for (OR logic — matches lines containing ANY pattern).",
				},
				path: {
					type: "string",
					description:
						"Directory or file path to search (default: current directory)",
				},
				constraints: {
					type: "string",
					description:
						"File constraints, e.g. '*.{ts,tsx} !test/' to filter files.",
				},
				context: {
					type: "number",
					description:
						"Number of context lines before and after each match (default: 0)",
				},
				limit: {
					type: "number",
					description: "Maximum number of matches to return (default: 100)",
				},
			},
			required: ["patterns"],
		},

		async execute(
			tid: string,
			params: MultiGrepParams,
			sig: AbortSignal | undefined,
			upd: unknown,
			toolCtx: ExtensionContext,
		) {
			if (sig?.aborted) return makeTextResult("Aborted", {});

			if (!params.patterns || params.patterns.length === 0) {
				return makeTextResult(
					"Error: patterns array must have at least 1 element",
					{ error: "empty patterns" },
				);
			}

			const effectiveLimit = Math.max(1, params.limit ?? 100);
			const pattern = buildLiteralAlternationPattern(params.patterns);
			const requestedPath = trimToUndefined(params.path);
			const requestedConstraints = trimToUndefined(params.constraints);
			const effectivePath =
				requestedPath ?? getConstraintBackedPath(requestedConstraints);
			const hasNativeConstraints = Boolean(
				requestedPath || requestedConstraints,
			);

			// FFF path (no constraints — constrained searches use ripgrep)
			if (
				fffState.finder &&
				!fffState.finder.isDestroyed &&
				!hasNativeConstraints
			) {
				try {
					const grepResult = fffState.finder.multiGrep({
						patterns: params.patterns,
						maxMatchesPerFile: Math.min(effectiveLimit, 50),
						smartCase: true,
						cursor: null,
						beforeContext: params.context ?? 0,
						afterContext: params.context ?? 0,
					});

					if (!grepResult.ok) {
						return makeTextResult(`multi_grep error: ${grepResult.error}`, {
							error: grepResult.error,
						});
					}

					const grep = grepResult.value;
					const notices: string[] = [];
					if (fffState.partialIndex)
						notices.push("Warning: partial file index");
					if (grep.items.length >= effectiveLimit)
						notices.push(`${effectiveLimit} limit reached`);
					if (grep.nextCursor) {
						const cursorId = cursorStore.store(grep.nextCursor);
						notices.push(`More results: cursor="${cursorId}"`);
					}

					const textContent = appendNotices(
						fffFormatGrepText(grep.items, effectiveLimit),
						notices,
					);
					return makeTextResult<GrepResultDetails>(textContent, {
						_type: "grepResult",
						text: textContent,
						pattern,
						matchCount: Math.min(grep.items.length, effectiveLimit),
					});
				} catch {
					/* fall through to SDK */
				}
			}

			// Ripgrep path (constrained, or FFF unavailable)
			if (requestedConstraints || !multiGrepFallback) {
				try {
					const pathBackedConstraint = Boolean(
						requestedConstraints &&
							!requestedPath &&
							requestedConstraints === effectivePath,
					);
					const constraintsForRipgrep = pathBackedConstraint
						? undefined
						: requestedConstraints;
					const notices: string[] = [];

					if (!fffState.finder || fffState.finder.isDestroyed)
						notices.push("FFF unavailable, used ripgrep fallback");
					else if (hasNativeConstraints)
						notices.push("Used ripgrep fallback for constrained search");
					else notices.push("Used ripgrep fallback");

					const rgResult = await multiGrepRipgrepFallback({
						cwd,
						patterns: params.patterns,
						path: effectivePath,
						constraints: constraintsForRipgrep,
						ignoreCase: shouldIgnoreCaseForPatterns(params.patterns),
						context: params.context,
						limit: effectiveLimit,
						signal: sig,
					});
					const textContent =
						normalizeLineEndings(rgResult.text) || "No matches found";
					if (rgResult.limitReached)
						notices.push(`${effectiveLimit} limit reached`);
					const finalText = appendNotices(textContent, notices);

					return makeTextResult<GrepResultDetails>(finalText, {
						_type: "grepResult",
						text: finalText,
						pattern,
						matchCount: rgResult.matchCount,
					});
				} catch (error: unknown) {
					const message = getErrorMessage(error);
					return makeTextResult(`multi_grep error: ${message}`, {
						error: message,
					});
				}
			}

			// SDK grep fallback
			try {
				const notices: string[] = [];
				if (!fffState.finder || fffState.finder.isDestroyed)
					notices.push("FFF unavailable, used SDK grep fallback");

				const result = await multiGrepFallback.execute(
					tid,
					{
						pattern,
						path: effectivePath,
						ignoreCase: shouldIgnoreCaseForPatterns(params.patterns),
						context: params.context,
						limit: params.limit,
					},
					sig,
					upd as never,
					toolCtx,
				);
				const textContent =
					normalizeLineEndings(getTextContent(result)) || "No matches found";
				const finalText = appendNotices(textContent, notices);

				return makeTextResult<GrepResultDetails>(finalText, {
					_type: "grepResult",
					text: finalText,
					pattern,
					matchCount: textContent ? countRipgrepMatches(textContent) : 0,
				});
			} catch (error: unknown) {
				const message = getErrorMessage(error);
				return makeTextResult(`multi_grep error: ${message}`, {
					error: message,
				});
			}
		},

		renderCall(
			args: MultiGrepParams,
			theme: ThemeLike,
			renderCtx: RenderContextLike,
		) {
			const patterns = args.patterns ?? [];
			const path = args.path
				? ` ${theme.fg("muted", `in ${sp(args.path)}`)}`
				: "";
			const constraints = args.constraints;
			const text = renderCtx.lastComponent ?? new TextComponent("", 0, 0);
			let content =
				theme.fg("toolTitle", theme.bold("multi_grep")) +
				" " +
				theme.fg("accent", patterns.map((p) => `"${p}"`).join(", "));
			content += path;
			if (constraints) content += theme.fg("muted", ` (${constraints})`);
			text.setText(content);
			return text;
		},

		renderResult(
			result: ToolResultLike<GrepResultDetails | { error?: string }>,
			_opt: ToolRenderResultOptions,
			theme: ThemeLike,
			renderCtx: RenderContextLike<MultiGrepRenderState>,
		) {
			const text = renderCtx.lastComponent ?? new TextComponent("", 0, 0);

			if (renderCtx.isError) {
				text.setText(
					`\n${theme.fg("error", getTextContent(result) || "Error")}`,
				);
				return text;
			}

			const d = result.details;
			if (d && "_type" in d && d._type === "grepResult" && d.text) {
				const key = `mgrep:${d.pattern}:${d.matchCount}:${termW()}`;
				if (renderCtx.state._mgk !== key) {
					renderCtx.state._mgk = key;
					const info = `${FG_DIM}${d.matchCount} matches${RST}`;
					renderCtx.state._mgt = `  ${info}`;

					renderGrepResults(d.text, d.pattern)
						.then((rendered: string) => {
							if (renderCtx.state._mgk !== key) return;
							renderCtx.state._mgt = `  ${info}\n${rendered}`;
							renderCtx.invalidate();
						})
						.catch(() => {});
				}
				text.setText(
					renderCtx.state._mgt ?? `  ${FG_DIM}${d.matchCount} matches${RST}`,
				);
				return text;
			}

			const fallback = result.content?.[0];
			const fallbackText =
				fallback && isTextContent(fallback) ? fallback.text : "searched";
			text.setText(`  ${theme.fg("dim", String(fallbackText).slice(0, 120))}`);
			return text;
		},
	});
}
