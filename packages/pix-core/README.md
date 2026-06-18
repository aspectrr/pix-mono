# pix-core

Pi coding agent extension — core UI/UX meta-package.

Installing `pix-core` pulls in all of the packages below as npm dependencies — no source code of its own.

## What's included

| Package | Description |
|---|---|
| `pix-welcome` | ASCII π banner + startup health checks (version, auth, models, gitignore) |
| `pix-footer` | Status bar: mode / git branch / model / cost / live TPS |
| `pix-models` | `/models` — enhanced model picker with BenchLM rank, context, cost |
| `pix-update` | `/update` — self-update Pi + refresh extensions |
| `pix-commands` | `/diff` and `/clear` slash commands |
| `pix-diagnostics` | Compact LSP diagnostic widget |
| `pix-prompts` | System-prompt injection (AGENTS.md + repo directive files) |
| `pix-skills` | Agent skill loader (`read_skills` tool + 21 bundled skills) |
| `pix-nudge` | Tool + capability nudge hooks |

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
