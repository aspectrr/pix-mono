# pix-gate

Pi extension — permission gate for dangerous bash commands.

## What it does

Intercepts every `bash` tool call and classifies the command against a set of severity rules before it runs. Three tiers apply: `critical` commands are blocked outright in non-interactive mode and hard-denied via dialog in TUI mode; `dangerous` commands (including any `sudo` invocation, which is redirected to `sudo_run`) show a 30-second auto-deny confirmation dialog; `risky` commands show a 60-second allow-first dialog and silently pass in non-interactive mode. Auto-approve patterns and extra rules can be configured in `~/.pi/agent/pix-gate.json`. Built-in rules can be replaced entirely by setting `disableDefaults: true` in the config file.

## Install

```bash
pi install npm:@xynogen/pix-gate
```

> Also included in [`@xynogen/pix-core`](https://github.com/xynogen/pix-mono/tree/main/packages/pix-core):
>
> ```bash
> pi install npm:@xynogen/pix-core
> ```

## Configuration

`~/.pi/agent/pix-gate.json`:

```json
{
  "disableDefaults": false,
  "extraRules": [
    { "pattern": "rm -rf /my-dir", "severity": "critical", "reason": "Deletes project root" }
  ],
  "autoApprove": ["^echo "]
}
```

## Full distro

To install the complete pix suite (all packages + Pi itself):

```bash
curl -fsSL https://raw.githubusercontent.com/xynogen/pix-mono/main/scripts/install.sh | sh
```

## License

MIT
