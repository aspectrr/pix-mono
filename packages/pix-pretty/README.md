# pix-pretty

Rendering and formatting library for Pi Coding Agent with syntax highlighting, file icons, tree views, FFF search integration, and gate-dialog overlay.

## What it does

This package is a **library + a small extension** that other pix packages
consume. It does not register user-facing tools itself — the tool renderers
(`pix-read`, `pix-bash`, `pix-ls`, `pix-find`, `pix-grep`, `pix-edit`,
`pix-write`) import from it. The extension entry point (`src/index.ts`) only
initializes the syntax-highlight theme from Pi settings, clears the highlight
cache, and registers two FFF slash commands (`/fff-health`, `/fff-rescan`)
once `pix-grep` has brought the FFF finder online.

### Rendering

- **Syntax highlighting** — `cli-highlight` (highlight.js-backed)
- **File icons** — type-aware icons in ls/find output
- **Tree views** — hierarchical directory display for ls
- **Diff rendering** — side-by-side split diff for edit/write
- **Bash exit summary** — colored status, line count, truncation notice

### Shared overlay

- **Gate overlay** (`./gate-overlay`) — the one permission-dialog component
  shared by `pix-gate` and `pix-sudo`. Two modes: `confirm` (SelectList) and
  `sudo` (SelectList + masked password). Returns
  `{ action: "approved" | "denied" | "timeout", password? }`. Padded with
  `Box` `paddingX=2`, `paddingY=1`. The simpler `./confirm` export is the
  plain boolean Yes/No dialog.

UI features that used to live here have moved to [`pix-display`](packages/pix-display):
paste chip rendering and reasoning-tag (`<think>`/`<thinking>`) → native
`thinking` content blocks.

## Install

```bash
pi install npm:@xynogen/pix-pretty
```

## Configuration

### Environment Variables

- `PRETTY_THEME` — color theme for syntax highlighting
- `PRETTY_MAX_HL_CHARS` — max characters to highlight (default: 80000)
- `PRETTY_MAX_PREVIEW_LINES` — max lines in preview output
- `PRETTY_CACHE_LIMIT` — FFF cache size limit
- `PRETTY_ICONS` — icon mode (`nerd` or `none`)
- `PRETTY_MAX_RENDER_LINES` — max lines in edit/write diff render (default: 150)
- `PRETTY_FFF_DIR` — override FFF state dir (default: `~/.cache/pi/fff`)

## Public exports

The package exposes its sub-modules via `exports`:

```
@xynogen/pix-pretty            (default — extension entry)
@xynogen/pix-pretty/ansi
@xynogen/pix-pretty/confirm
@xynogen/pix-pretty/progress
@xynogen/pix-pretty/config
@xynogen/pix-pretty/diff
@xynogen/pix-pretty/diff-render
@xynogen/pix-pretty/highlight
@xynogen/pix-pretty/lang
@xynogen/pix-pretty/icons
@xynogen/pix-pretty/renderers
@xynogen/pix-pretty/fff
@xynogen/pix-pretty/types
@xynogen/pix-pretty/utils
@xynogen/pix-pretty/resize
@xynogen/pix-pretty/context
@xynogen/pix-pretty/gate-overlay
@xynogen/pix-pretty/modal-frame
```

## Full distro

Source: [github.com/xynogen/pix-mono](https://github.com/xynogen/pix-mono)

To install the complete pix suite (all packages + Pi itself):

```bash
curl -fsSL https://raw.githubusercontent.com/xynogen/pix-mono/main/scripts/install.sh | sh
```

## License

MIT
