# pix-ask

Pi tool — structured questionnaire UI (`ask_user`).

## What it does

Registers the `ask_user` tool in Pi. When the agent needs to resolve ambiguous requirements, it presents up to 4 structured multiple-choice questions in a TUI dialog. Each question requires 2–4 options with labels and descriptions; supports multi-select and markdown side-by-side previews for richer context. Single-select questions auto-append a "Type something." row for free-form input and always include "Chat about this" as an escape hatch. In non-interactive (RPC/JSON) mode, falls back to text-based prompts. The agent uses this tool before proceeding rather than guessing at intent.

## Install

```bash
pi install npm:@xynogen/pix-ask
```

## Full distro

Source: [github.com/xynogen/pix-mono](https://github.com/xynogen/pix-mono)

To install the complete pix suite (all packages + Pi itself):

```bash
curl -fsSL https://raw.githubusercontent.com/xynogen/pix-mono/main/scripts/install.sh | sh
```

## License

MIT
