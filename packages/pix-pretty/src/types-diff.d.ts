// Minimal ambient shim for the `diff` npm package (v7) — only the surface the
// vendored pretty extension's diff renderer uses. diff@7 ships no bundled types
// and @types/diff is not installed into pi's npm root; this keeps the local
// editor/LSP quiet without vendoring node_modules in-repo.

declare module "diff" {
	export interface StructuredPatchHunk {
		oldStart: number;
		oldLines: number;
		newStart: number;
		newLines: number;
		lines: string[];
	}

	export interface StructuredPatch {
		hunks: StructuredPatchHunk[];
	}

	export function structuredPatch(
		oldFileName: string,
		newFileName: string,
		oldStr: string,
		newStr: string,
		oldHeader?: string,
		newHeader?: string,
		options?: { context?: number },
	): StructuredPatch;

	export interface Change {
		value: string;
		added?: boolean;
		removed?: boolean;
		count?: number;
	}

	export function diffWords(
		oldStr: string,
		newStr: string,
		options?: unknown,
	): Change[];
}
