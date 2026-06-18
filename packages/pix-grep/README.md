# pix-grep

Pi tool — pattern search in files with FFF acceleration.

## What it does

Replaces Pi's default `grep` tool with an enhanced version backed by `pix-pretty`. Uses FFF (frecency-ranked file index) to prioritise recently-touched files when available, falling back to standard ripgrep. Results are rendered with match counts, file paths, line numbers, and a dim inline preview. Call labels show the search pattern and scope. Depends on `@xynogen/pix-pretty`, installed automatically as a dependency.

## Install

```bash
pi install npm:@xynogen/pix-grep
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
