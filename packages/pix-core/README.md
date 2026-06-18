# pix-core

Pi coding agent extension — core UI/UX bundle.

## What's included

| Extension | Type | Description |
|---|---|---|
| `welcome` | lifecycle | ASCII π banner + startup health checks (version, auth, models, gitignore) |
| `footer` | UI | Status bar: mode / git branch / model / cost / tps |
| `models` | command | `/models` — enhanced model picker with BenchLM rank, context, cost |
| `update` | command | `/update` — self-update Pi + refresh extensions from dotfiles |
| `lg` | command | `/lg` — summarize unstaged git changes with per-file +/- counts |
| `yeet` | command | `/yeet` — stage all, commit, and push current changes |
| `copy-all` | command | `/copy-all` — copy the whole conversation to the clipboard |
| `diff` | command | `/diff` — list/open files changed during the last agent run |
| `todo` | tool | durable execution checklist (survives compaction) |
| `toolbox` | tool | `search` (fuzzy-find every tool / MCP tool / skill / command), `enable` / `disable` (turn a gated tool on/off by name) |
| `nudges` | hooks | model-steering reminders (tools / skill / capability) |

## Install

```bash
pi install npm:@xynogen/pix-core
```

> Includes the core pix UI/UX packages and installs their dependencies.

## Full distro

To install the complete pix suite (all packages + Pi itself):

```bash
curl -fsSL https://raw.githubusercontent.com/xynogen/pix-mono/main/scripts/install.sh | sh
```

## License

MIT
