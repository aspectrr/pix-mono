# pix-footer

Pi extension — status bar footer.

## What it does

Renders a persistent status bar at the bottom of the Pi TUI. The footer shows: current mode, working directory with git branch (including dirty/ahead/behind markers), cumulative session token counts (in/out), context usage percentage, session cost, and active model name. During a streaming response it displays live tokens-per-second (TPS), holding the last value for 5 seconds after the turn ends. Model spec (context window, pricing) is sourced from `~/.cache/pi/models-dev.json` via `pix-data`. Extension statuses (e.g. plan mode) are surfaced as additional segments on the right. Requires `@xynogen/pix-data` as a dependency.

## Install

```bash
pi install npm:@xynogen/pix-footer
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
