# pix-update

Pi extension — `/update` self-update command.

## What it does

Registers a `/update` slash command that updates Pi and its installed extensions in place. Detects the Pi install method (Volta, Bun, npm, Homebrew, or native package manager) and runs the appropriate upgrade command. Handles transient errors (rate limits, timeouts, network failures) with a retry loop, distinguishing them from hard failures. After updating Pi, it also refreshes all installed extensions. The command reports progress live in the TUI and notifies you to restart Pi when the update completes.

## Install

```bash
pi install npm:@xynogen/pix-update
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
