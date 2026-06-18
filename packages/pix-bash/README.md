# pix-bash

Pi tool — bash shell execution with pretty output.

## What it does

Replaces Pi's default `bash` tool with an enhanced version backed by `pix-pretty`. Output is rendered in a full-width framed block showing an exit-code summary, line count, and truncation notice. Call labels display the command inline; multi-line commands collapse to the first line with `… (+N lines)` until expanded. In expanded mode the full output is shown; collapsed mode caps the preview to a configurable line limit. Depends on `@xynogen/pix-pretty`, which is installed automatically as a dependency.

## Install

```bash
pi install npm:@xynogen/pix-bash
```

## Full distro

To install the complete pix suite (all packages + Pi itself):

```bash
curl -fsSL https://raw.githubusercontent.com/xynogen/pix-mono/main/scripts/install.sh | sh
```

## License

MIT
