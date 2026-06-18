# pix-sudo

Pi tool — `sudo_run` with interactive PAM password prompt.

## What it does

Registers the `sudo_run` tool, which executes shell commands as root after a two-stage TUI overlay. Stage 1 shows the command and AI-stated intent with Allow/Deny buttons and a 30-second auto-deny timeout. Stage 2 presents a masked password input (`●` per character) inside the same overlay; the password is passed to `sudo -kS` via stdin, never written to disk, and cleared from memory immediately after use. `-k` invalidates any cached sudo ticket so PAM always re-checks credentials. Output is truncated to 50 KB / 2000 lines. In non-interactive (RPC/JSON) mode the tool is blocked immediately with an error.

## Install

```bash
pi install npm:@xynogen/pix-sudo
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
