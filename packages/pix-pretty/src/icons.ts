import { basename, extname } from "node:path";

import { FG_BLUE, FG_DIM, RST } from "./ansi.js";

const ICONS_MODE = (process.env.PRETTY_ICONS ?? "nerd").toLowerCase();

const USE_ICONS = ICONS_MODE !== "none" && ICONS_MODE !== "off";

// Nerd Font codepoints + ANSI color per file type
const NF_DIR = `${FG_BLUE}\ue5ff${RST}`; // folder

const NF_DEFAULT = `${FG_DIM}\uf15b${RST}`; // generic file

const EXT_ICON: Record<string, string> = {
	// TypeScript / JavaScript
	ts: `\x1b[38;2;49;120;198m\ue628${RST}`, // blue
	tsx: `\x1b[38;2;49;120;198m\ue7ba${RST}`, // react blue
	js: `\x1b[38;2;241;224;90m\ue74e${RST}`, // yellow
	jsx: `\x1b[38;2;97;218;251m\ue7ba${RST}`, // react cyan
	mjs: `\x1b[38;2;241;224;90m\ue74e${RST}`,
	cjs: `\x1b[38;2;241;224;90m\ue74e${RST}`,

	// Systems / Backend
	py: `\x1b[38;2;55;118;171m\ue73c${RST}`, // python blue
	rs: `\x1b[38;2;222;165;132m\ue7a8${RST}`, // rust orange
	go: `\x1b[38;2;0;173;216m\ue724${RST}`, // go cyan
	java: `\x1b[38;2;204;62;68m\ue738${RST}`, // java red
	swift: `\x1b[38;2;255;172;77m\ue755${RST}`, // swift orange
	rb: `\x1b[38;2;204;52;45m\ue739${RST}`, // ruby red
	kt: `\x1b[38;2;126;103;200m\ue634${RST}`, // kotlin purple
	c: `\x1b[38;2;85;154;211m\ue61e${RST}`, // c blue
	cpp: `\x1b[38;2;85;154;211m\ue61d${RST}`, // cpp blue
	h: `\x1b[38;2;140;160;185m\ue61e${RST}`, // header muted
	hpp: `\x1b[38;2;140;160;185m\ue61d${RST}`,
	cs: `\x1b[38;2;104;33;122m\ue648${RST}`, // c# purple

	// Web
	html: `\x1b[38;2;228;77;38m\ue736${RST}`, // html orange
	css: `\x1b[38;2;66;165;245m\ue749${RST}`, // css blue
	scss: `\x1b[38;2;207;100;154m\ue749${RST}`, // scss pink
	less: `\x1b[38;2;66;165;245m\ue749${RST}`,
	vue: `\x1b[38;2;65;184;131m\ue6a0${RST}`, // vue green
	svelte: `\x1b[38;2;255;62;0m\ue697${RST}`, // svelte red-orange

	// Config / Data
	json: `\x1b[38;2;241;224;90m\ue60b${RST}`, // json yellow
	jsonc: `\x1b[38;2;241;224;90m\ue60b${RST}`,
	yaml: `\x1b[38;2;160;116;196m\ue6a8${RST}`, // yaml purple
	yml: `\x1b[38;2;160;116;196m\ue6a8${RST}`,
	toml: `\x1b[38;2;160;116;196m\ue6b2${RST}`, // toml purple
	xml: `\x1b[38;2;228;77;38m\ue619${RST}`, // xml orange
	sql: `\x1b[38;2;218;218;218m\ue706${RST}`, // sql gray

	// Markdown / Docs
	md: `\x1b[38;2;66;165;245m\ue73e${RST}`, // markdown blue
	mdx: `\x1b[38;2;66;165;245m\ue73e${RST}`,

	// Shell / Scripts
	sh: `\x1b[38;2;137;180;130m\ue795${RST}`, // shell green
	bash: `\x1b[38;2;137;180;130m\ue795${RST}`,
	zsh: `\x1b[38;2;137;180;130m\ue795${RST}`,
	fish: `\x1b[38;2;137;180;130m\ue795${RST}`,
	lua: `\x1b[38;2;81;160;207m\ue620${RST}`, // lua blue
	php: `\x1b[38;2;137;147;186m\ue73d${RST}`, // php purple
	dart: `\x1b[38;2;87;182;240m\ue798${RST}`, // dart blue

	// Images
	png: `\x1b[38;2;160;116;196m\uf1c5${RST}`,
	jpg: `\x1b[38;2;160;116;196m\uf1c5${RST}`,
	jpeg: `\x1b[38;2;160;116;196m\uf1c5${RST}`,
	gif: `\x1b[38;2;160;116;196m\uf1c5${RST}`,
	svg: `\x1b[38;2;255;180;50m\uf1c5${RST}`,
	webp: `\x1b[38;2;160;116;196m\uf1c5${RST}`,
	ico: `\x1b[38;2;160;116;196m\uf1c5${RST}`,

	// Misc
	lock: `\x1b[38;2;130;130;130m\uf023${RST}`, // lock gray
	env: `\x1b[38;2;241;224;90m\ue615${RST}`, // env yellow
	graphql: `\x1b[38;2;224;51;144m\ue662${RST}`, // graphql pink
	dockerfile: `\x1b[38;2;56;152;236m\ue7b0${RST}`,
};

const NAME_ICON: Record<string, string> = {
	"package.json": `\x1b[38;2;137;180;130m\ue71e${RST}`, // npm green
	"package-lock.json": `\x1b[38;2;130;130;130m\ue71e${RST}`, // npm gray
	"tsconfig.json": `\x1b[38;2;49;120;198m\ue628${RST}`, // ts blue
	"biome.json": `\x1b[38;2;96;165;250m\ue615${RST}`, // config blue
	".gitignore": `\x1b[38;2;222;165;132m\ue702${RST}`, // git orange
	".git": `\x1b[38;2;222;165;132m\ue702${RST}`,
	".env": `\x1b[38;2;241;224;90m\ue615${RST}`, // env yellow
	".envrc": `\x1b[38;2;241;224;90m\ue615${RST}`,
	dockerfile: `\x1b[38;2;56;152;236m\ue7b0${RST}`, // docker blue
	makefile: `\x1b[38;2;130;130;130m\ue615${RST}`, // make gray
	gnumakefile: `\x1b[38;2;130;130;130m\ue615${RST}`,
	"readme.md": `\x1b[38;2;66;165;245m\ue73e${RST}`, // readme blue
	license: `\x1b[38;2;218;218;218m\ue60a${RST}`, // license white
	"cargo.toml": `\x1b[38;2;222;165;132m\ue7a8${RST}`, // rust
	"go.mod": `\x1b[38;2;0;173;216m\ue724${RST}`, // go
	"pyproject.toml": `\x1b[38;2;55;118;171m\ue73c${RST}`, // python
};

export function fileIcon(fp: string): string {
	if (!USE_ICONS) return "";
	const base = basename(fp).toLowerCase();
	if (NAME_ICON[base]) return `${NAME_ICON[base]} `;
	const ext = extname(fp).slice(1).toLowerCase();
	return EXT_ICON[ext] ? `${EXT_ICON[ext]} ` : `${NF_DEFAULT} `;
}

export function dirIcon(): string {
	return USE_ICONS ? `${NF_DIR} ` : "";
}

// ---------------------------------------------------------------------------
// cli-highlight ANSI cache
//
// highlight.js uses different language ids than shiki for a few entries
// (no tsx/jsx grammar, jsonc, mdx, make, etc.). Map the shiki-style ids the
// EXT_LANG table produces onto highlight.js-supported ids.
// ---------------------------------------------------------------------------
