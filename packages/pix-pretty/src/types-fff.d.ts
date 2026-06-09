// Minimal ambient shim for @ff-labs/fff-node — only the surface the vendored
// pretty extension uses. The real types ship with the runtime package; this
// keeps the local editor/LSP quiet without installing node_modules in-repo.

declare module "@ff-labs/fff-node" {
	export interface FileItem {
		relativePath: string;
		[k: string]: unknown;
	}
	export interface SearchResult {
		items: FileItem[];
		totalMatched: number;
		[k: string]: unknown;
	}
	export interface GrepMatch {
		relativePath: string;
		lineNumber: number;
		lineContent: string;
		contextBefore?: string[];
		contextAfter?: string[];
		[k: string]: unknown;
	}
	export interface GrepCursor {
		[k: string]: unknown;
	}
	export interface GrepResult {
		items: GrepMatch[];
		nextCursor?: GrepCursor | null;
		regexFallbackError?: string | null;
		[k: string]: unknown;
	}

	type Ok<T> = { ok: true; value: T };
	type Err = { ok: false; error: string };
	type Result<T> = Ok<T> | Err;

	export class FileFinder {
		static create(opts: {
			basePath: string;
			frecencyDbPath: string;
			historyDbPath: string;
			aiMode?: boolean;
		}): Result<FileFinder>;
		readonly isDestroyed: boolean;
		waitForScan(timeoutMs: number): Promise<Result<boolean>>;
		fileSearch(query: string, opts: { pageSize: number }): Result<SearchResult>;
		grep(
			query: string,
			opts: {
				mode: "plain" | "regex";
				smartCase: boolean;
				maxMatchesPerFile: number;
				cursor: GrepCursor | null;
				beforeContext: number;
				afterContext: number;
			},
		): Result<GrepResult>;
		multiGrep(opts: {
			patterns: string[];
			maxMatchesPerFile: number;
			smartCase: boolean;
			cursor: GrepCursor | null;
			beforeContext: number;
			afterContext: number;
		}): Result<GrepResult>;
		healthCheck(): Result<{
			version: string;
			git: { repositoryFound: boolean; workdir?: string };
			filePicker: { initialized: boolean; indexedFiles?: number };
			frecency: { initialized: boolean };
			queryTracker: { initialized: boolean };
		}>;
		getScanProgress(): Result<{
			isScanning: boolean;
			scannedFilesCount: number;
		}>;
		scanFiles(): Result<unknown>;
		destroy(): void;
	}
}
