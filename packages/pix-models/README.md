# pix-models

Pi extension — enhanced `/models` picker with BenchLM ranks.

## What it does

Registers a `/models` slash command that replaces Pi's built-in `/model` selector with a richer TUI picker. Each row shows model name, provider, context window, cost per million tokens, and BenchLM rank/score when available. The list is sorted by BenchLM rank (best first), then alphabetically for unranked models. Fuzzy search filters the list as you type. Selecting a model switches the active model for the session. Model metadata is sourced from `~/.cache/pi/` via `pix-data`; BenchLM data is fetched and cached at startup. Requires `@xynogen/pix-data` as a dependency.

## Install

```bash
pi install npm:@xynogen/pix-models
```

> Also included in [`@xynogen/pix-core`](https://www.npmjs.com/package/@xynogen/pix-core):
>
> ```bash
> pi install npm:@xynogen/pix-core
> ```

## Full distro

Source: [github.com/xynogen/pix-mono](https://github.com/xynogen/pix-mono)

To install the complete pix suite (all packages + Pi itself):

```bash
curl -fsSL https://raw.githubusercontent.com/xynogen/pix-mono/main/scripts/install.sh | sh
```

## License

MIT
