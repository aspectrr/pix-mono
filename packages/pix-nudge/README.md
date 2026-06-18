# pix-nudge

Pi extension — model-steering nudges (tools + capability).

## What it does

Registers two complementary nudge hooks. The **tools nudge** intercepts `bash` tool calls that merely reimplement a first-class tool (`read`, `ls`, `grep`, `find`, `edit`, `write`) and blocks the call once per command category per session, redirecting the model to use the proper tool instead. After the first nudge for a category, subsequent bash calls are allowed — no nag loop. The **capability nudge** injects an orientation block on the first prompt of each session (tool counts, MCP tools, available skills) and a short one-line reminder on every subsequent prompt, steering the model toward `read_skills()` and the `/toolbox` command for tool discovery rather than guessing. Both nudges are surgical: they name only the relevant tool, not a full inventory.

## Install

```bash
pi install npm:@xynogen/pix-nudge
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
