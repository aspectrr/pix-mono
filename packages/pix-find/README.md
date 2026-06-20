# pix-find

Pi tool — glob file search with FFF acceleration.

## What it does

Replaces Pi's default `find` tool with an enhanced version backed by `pix-pretty`. Uses FFF (frecency-ranked, SIMD-accelerated file finder) when available, falling back to the standard glob search. Results are rendered with file icons, match counts, and a dim preview of the top hits. Call labels show the glob pattern and search directory inline. Depends on `@xynogen/pix-pretty`, installed automatically as a dependency.

## Install

```bash
pi install npm:@xynogen/pix-find
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
