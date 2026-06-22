# pix-pretty

Complete rendering and formatting solution for Pi Coding Agent with syntax highlighting, file icons, tree views, FFF search, paste chip formatting, and reasoning tag cleanup.

## Features

### Tool Output Rendering

- **Syntax highlighting** - Uses `cli-highlight` (highlight.js-backed) for code blocks
- **File icons** - Visual file type indicators in ls/find output
- **Tree views** - Hierarchical directory display
- **FFF search** - Fast full-text search integration with `@ff-labs/fff-node`
- **Diff rendering** - Enhanced git diff and edit/write tool output
- **Image metadata** - Display image dimensions and format info
- **Bash exit summary** - Command status and timing info

### Paste Chip Formatting

- **Image path collapsing** - Converts `/tmp/pi-clipboard-abc.png` → `[paste image #1]`
- **Text paste markers** - Long pasted text → `[paste text +42 lines]`
- **Atomic deletion** - Delete entire paste markers as single units
- **Type-aware labels** - Visual distinction between image and text pastes

### Permission Dialog Overlay

- **Shared gate overlay** - `showOverlay(ui, config)` (export `./gate-overlay`) is the one permission-dialog component used by both `pix-gate` and `pix-sudo`. Two modes: `mode:"confirm"` shows a SelectList only; `mode:"sudo"` shows a SelectList then a masked password stage. Returns `{ action: "approved" | "denied" | "timeout", password? }`. All dialogs are padded (`Box` `paddingX=2`, `paddingY=1`). The simpler `./confirm` export stays for plain boolean Yes/No prompts — `gate-overlay` is its richer multi-choice, password-capable sibling.

### Reasoning Tag Rendering

- **Live streaming** - Splits `<think>`/`<thinking>` regions into native Pi `thinking` content blocks token-by-token during streaming
- **Finalized cleanup** - On `message_end`, re-splits every affected text block for persistence (the finalized message bypasses the live rebuild)
- **Partial-tag safety** - Strips trailing half-streamed tags (e.g. `<thin`) so they never flash as literal text
- **Visual distinction** - Uses Pi's native `thinking` block rendering (dim + italic via `thinkingText` theme token) — no ANSI injection, no markdown blockquote shim

## Installation

```bash
pi install npm:@xynogen/pix-pretty
```

## Configuration

### Environment Variables

**Tool rendering:**

- `PRETTY_THEME` - Color theme for syntax highlighting
- `PRETTY_MAX_HL_CHARS` - Max characters to highlight (default: 80000)
- `PRETTY_MAX_PREVIEW_LINES` - Max lines in preview output
- `PRETTY_CACHE_LIMIT` - FFF cache size limit
- `PRETTY_ICONS` - Enable/disable file icons
- `PRETTY_DISABLE_TOOLS` - Comma-separated list of tools to skip rendering
- `PRETTY_IMAGE_PROTOCOL` - Protocol for image display (tmux passthrough)
- `PRETTY_FFF_DIR` - Override FFF state dir (default: `~/.cache/pi/fff`)

## Architecture

This package combines two rendering systems:

1. **Theme + FFF commands** (`src/index.ts`) - Initialises syntax-highlight theme from Pi settings, clears highlight cache, and registers FFF slash commands. Tool renderers live in the standalone `pix-{read,bash,ls,find,grep,edit,write}` packages — each self-registers via its own Pi extension entry point.
2. **Paste chip formatting** (`src/paste-chips.ts`) - Custom editor component for paste markers.
3. **Reasoning tag rendering** (`src/thinking.ts`) - Converts leaked `<think>`/`<thinking>` tags into native Pi `thinking` content blocks (dim + italic via `thinkingText` theme token).

Both work independently but complement each other for a cohesive visual experience.

## Origin

Tool rendering replaced `npm:@heyhuynhgiabuu/pi-pretty` (which was previously replaced by `npm:@heyhuynhgiabuu/pi-diff`). This package is a clean reimplementation — no code was copied directly. Developed independently; changes are not submitted back and upstream changes are not pulled in.

Key divergences from upstream:

1. **Highlight engine: shiki → cli-highlight** - Simpler, no WASM, synchronous
2. **FFF state dir** - `~/.pi/agent/pi-pretty/fff` → `~/.cache/pi/fff` (XDG cache)
3. **Split diff view for edit/write tools** - Full side-by-side diff with gutter, line numbers, syntax highlighting
4. **Paste chip formatting** - Custom editor component for Pi's paste marker system (not in upstream)
5. **Reasoning tag rendering** - Converts leaked `<think>`/`<thinking>` tags into native Pi `thinking` content blocks (not in upstream)

Paste chip formatting and reasoning tag rendering are original additions with no upstream equivalent.

## Full distro

Source: [github.com/xynogen/pix-mono](https://github.com/xynogen/pix-mono)

To install the complete pix suite (all packages + Pi itself):

```bash
curl -fsSL https://raw.githubusercontent.com/xynogen/pix-mono/main/scripts/install.sh | sh
```

## License

MIT
