# pix-diagnostics

Pi extension — lightweight LSP diagnostic widget.

## What it does

Registers a compact LSP diagnostic widget using the `pi-lens` widget id, overriding the external pi-lens package when both are installed. The header line shows total error and warning counts across recently-touched files (e.g. `●4E !1W`). Expanding the widget reveals up to 3 diagnostics with file path, line number, and message; a `+N more` line is appended when the total exceeds 3. File records are tracked per session and pruned automatically.

## Install

```bash
pi install npm:@xynogen/pix-diagnostics
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
