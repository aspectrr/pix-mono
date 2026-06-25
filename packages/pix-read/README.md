# pix-read

Pi tool — file read with syntax highlighting.

## What it does

Replaces Pi's default `read` tool with an enhanced version backed by `pix-pretty`. File content is syntax-highlighted using `cli-highlight` (highlight.js-backed) with language auto-detection. The call label shows the shortened file path, with optional `from line N` and `(N lines)` hints. Images are displayed with mime type and byte size and a type icon. Long files are shown with a line count and truncation notice; expanded mode reveals the full content. Depends on `@xynogen/pix-pretty`, installed automatically as a dependency.

## Install

```bash
pi install npm:@xynogen/pix-read
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
