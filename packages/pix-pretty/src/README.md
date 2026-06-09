# pretty (vendored)

Local fork of [`@heyhuynhgiabuu/pi-pretty`](https://github.com/buddingnewinsights/pi-pretty)
(v0.5.1). Enhances built-in `read` / `bash` / `ls` / `find` / `grep` /
`multi_grep` tool output with syntax highlighting, file icons, tree views, and
FFF-backed search.

## Why vendored

We need two behavioral changes the upstream package does not expose as config,
so the source is copied here 1:1 and patched:

1. **Highlight engine: shiki → cli-highlight.**
   Upstream uses `@shikijs/cli` (`codeToANSI`, TextMate grammars + WASM).
   This fork uses [`cli-highlight`](https://www.npmjs.com/package/cli-highlight)
   (highlight.js-backed, synchronous). The `hlBlock` interface, language table,
   line-number layout, and low-contrast normalization are unchanged.

2. **FFF state dir: `~/.pi/agent/pi-pretty/fff` → `~/.cache/pi/fff`.**
   `getPiPrettyFffDir()` now resolves to `$XDG_CACHE_HOME/pi/fff`
   (default `~/.cache/pi/fff`), overridable with `PRETTY_FFF_DIR`.

Everything else (bash exit summary, ls tree, find grouping, grep highlighting,
image metadata, tmux passthrough, `/fff-health`, `/fff-rescan`, multi_grep
ripgrep fallback) is byte-for-byte upstream.

## Diff vs upstream

- `index.ts`
  - imports: `@shikijs/cli` + `shiki` types → `cli-highlight` (lazy `require`)
    with local `BundledLanguage`/`BundledTheme = string` aliases.
  - `FORCE_COLOR=3` default before chalk init (shiki always emitted truecolor;
    chalk decides level once at load). Respects an explicit `FORCE_COLOR` /
    `NO_COLOR`.
  - `HLJS_LANG_ALIAS` maps shiki-style ids (`tsx`, `jsx`, `jsonc`, `mdx`,
    `make`, `svelte`, `vue`) onto highlight.js-supported ids.
  - `hlBlock()` calls `highlight(code, { language, ignoreIllegals: true })`
    instead of `await codeToANSI(...)`. Still async-typed so call sites match.
  - `getPiPrettyFffDir()` → `~/.cache/pi/fff`.
- `fff-helpers.ts`, `multi-grep-fallback.ts` — unchanged.

## Runtime deps & module resolution

`cli-highlight` and `@ff-labs/fff-node` are installed into pi's npm root
(`~/.pi/agent/npm/node_modules`) by `setup.sh`. Because the extensions dir is a
symlink into dotfiles and Node dereferences symlinks before resolving bare
imports, `setup.sh` also creates a git-ignored
`extensions/node_modules` → `~/.pi/agent/npm/node_modules` bridge next to the
real source so `require("cli-highlight")` / `import("@ff-labs/fff-node")`
resolve.

The upstream `npm:@heyhuynhgiabuu/pi-pretty` package is uninstalled by
`setup.sh` — both register the same tool names and pi does not share tool-name
ownership across extensions.

## Env vars

Same as upstream (`PRETTY_THEME`, `PRETTY_MAX_HL_CHARS`,
`PRETTY_MAX_PREVIEW_LINES`, `PRETTY_CACHE_LIMIT`, `PRETTY_ICONS`,
`PRETTY_DISABLE_TOOLS`, `PRETTY_IMAGE_PROTOCOL`) plus:

- `PRETTY_FFF_DIR` — override the FFF state dir (default `~/.cache/pi/fff`).

## License

MIT — upstream by huynhgiabuu. See upstream repo.
