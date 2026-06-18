# pix-write

Pi tool — file write with diff rendering.

## What it does

Replaces Pi's default `write` tool with an enhanced version that renders a side-by-side split diff when overwriting an existing file. New files are shown with full syntax-highlighted content. The diff uses `pix-pretty`'s diff engine: syntax-highlighted old/new panes with gutter markers, line numbers, and a change summary. Call labels show the target file path and write mode. Depends on `@xynogen/pix-pretty`, installed automatically as a dependency.

## Install

```bash
pi install npm:@xynogen/pix-write
```

## Full distro

To install the complete pix suite (all packages + Pi itself):

```bash
curl -fsSL https://raw.githubusercontent.com/xynogen/pix-mono/main/scripts/install.sh | sh
```

## License

MIT
