# pix-edit

Pi tool — precise text replacement edit with diff rendering.

## What it does

Replaces Pi's default `edit` tool with an enhanced version that renders a side-by-side split diff after every edit. The diff is syntax-highlighted with gutter markers, line numbers, and a change summary produced by `pix-pretty`'s diff engine. Batched edits (multiple `{oldText, newText}` pairs in one call) each render their own diff block. Call labels show the target file path and the number of edits being applied. Depends on `@xynogen/pix-pretty`, installed automatically as a dependency.

## Install

```bash
pi install npm:@xynogen/pix-edit
```

## Full distro

To install the complete pix suite (all packages + Pi itself):

```bash
curl -fsSL https://raw.githubusercontent.com/xynogen/pix-mono/main/scripts/install.sh | sh
```

## License

MIT
