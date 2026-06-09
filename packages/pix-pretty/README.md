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

### Reasoning Tag Rendering
- **Collapsible display** - Renders leaked `<think>`/`<thinking>` tags as collapsible HTML details blocks
- **Visual distinction** - Uses ⚙ icon to clearly mark reasoning content
- **Non-intrusive** - Only processes finalized messages, no live mutation
- **Context-efficient** - Collapsible format minimizes visual clutter (toggle with ctrl+o in Pi agent)

## Installation

```bash
pi install git:github.com/xynogen/pix-pretty
```

## Configuration

### Environment Variables

**Tool rendering:**
- `PRETTY_THEME` - Color theme for syntax highlighting
- `PRETTY_MAX_HL_CHARS` - Max characters to highlight (default: 50000)
- `PRETTY_MAX_PREVIEW_LINES` - Max lines in preview output
- `PRETTY_CACHE_LIMIT` - FFF cache size limit
- `PRETTY_ICONS` - Enable/disable file icons
- `PRETTY_DISABLE_TOOLS` - Comma-separated list of tools to skip rendering
- `PRETTY_IMAGE_PROTOCOL` - Protocol for image display (tmux passthrough)
- `PRETTY_FFF_DIR` - Override FFF state dir (default: `~/.cache/pi/fff`)

## Architecture

This package combines two rendering systems:

1. **Tool output rendering** (`src/index.ts`) - Intercepts read/bash/ls/find/grep/multi_grep tools
2. **Paste chip formatting** (`src/paste-chips.ts`) - Custom editor component for paste markers

Both work independently but complement each other for a cohesive visual experience.

## Origin

Tool rendering is a vendored fork of [`@heyhuynhgiabuu/pi-pretty`](https://github.com/buddingnewinsights/pi-pretty) with two key changes:

1. **Highlight engine: shiki → cli-highlight** - Simpler, synchronous, no WASM
2. **FFF state dir: `~/.pi/agent/pi-pretty/fff` → `~/.cache/pi/fff`** - Standard XDG cache location

Paste chip formatting is custom logic for Pi's paste marker system.

## License

MIT - See LICENSE file
