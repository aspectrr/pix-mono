# pix-welcome

Pi extension — welcome banner with startup health checks.

## What it does

Renders a coloured ASCII π logo above the editor on session start and runs startup health checks in parallel while the banner is visible. Checks include: Pi version, auth status (at least one provider configured), and gitignore hygiene (auto-adds `.ai` and `.pi-lens` to `.gitignore` in git repos). Each check updates the banner live as results arrive, showing ✓/✗ and a brief status. The banner auto-dismisses on the first user turn. No configuration required.

## Install

```bash
pi install npm:@xynogen/pix-welcome
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
