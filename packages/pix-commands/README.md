# pix-commands

Pi extension — `/diff` and `/clear` slash commands.

## What it does

Registers two slash commands. `/diff` asks the agent to inspect `git status` and `git diff`, then respond with a one-sentence TL;DR, a per-file breakdown of what changed and why (with +/− line counts), and a brief impact note on behaviour or tests. If an agent turn is already in progress, the prompt is queued as a follow-up. `/clear` deletes `~/.cache/pi` — useful for flushing stale model-data or BenchLM cache — and prompts you to run `/reload` to apply the change. No extra dependencies beyond Pi.

## Install

```bash
pi install npm:@xynogen/pix-commands
```

> Also included in [`@xynogen/pix-core`](https://github.com/xynogen/pix-mono/tree/main/packages/pix-core):
>
> ```bash
> pi install npm:@xynogen/pix-core
> ```

## Full distro

To install the complete pix suite (all packages + Pi itself):

```bash
curl -fsSL https://raw.githubusercontent.com/xynogen/pix-mono/main/scripts/install.sh | sh
```

## License

MIT
