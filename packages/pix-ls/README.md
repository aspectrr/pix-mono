# pix-ls

Pi tool — directory listing with tree view.

## What it does

Replaces Pi's default `ls` tool with an enhanced version backed by `pix-pretty`. Output is rendered as an indented tree with file/directory icons and a total entry-count header. Call labels show the target path inline. Depends on `@xynogen/pix-pretty`, installed automatically as a dependency.

## Install

```bash
pi install npm:@xynogen/pix-ls
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
