# pix-mono

Monorepo of [Pi Coding Agent](https://github.com/badlogic/pi-mono) extensions by xynogen.

## Packages

| Package | Description |
| --- | --- |
| [`@xynogen/pix-9router`](packages/pix-9router) | 9Router provider + fetch/search tools via router API |
| [`@xynogen/pix-core`](packages/pix-core) | Core UI/UX bundle (welcome banner, footer, model picker, self-update) |
| [`@xynogen/pix-data`](packages/pix-data) | Shared model data layer (models.dev + BenchLM), cached at `~/.cache/pi` |
| [`@xynogen/pix-optimizer`](packages/pix-optimizer) | Performance suite — caveman mode + RTK tool rewriting + jq/TOON JSON compression |
| [`@xynogen/pix-pretty`](packages/pix-pretty) | Enhanced tool output rendering — syntax highlighting, icons, tree views, FFF, paste chips |
| [`@xynogen/pix-tokyo-night`](packages/pix-tokyo-night) | Tokyo Night Storm theme |

## Install (as Pi packages)

```bash
pi install npm:@xynogen/pix-core
pi install npm:@xynogen/pix-pretty
pi install npm:@xynogen/pix-optimizer
pi install npm:@xynogen/pix-tokyo-night
pi install npm:@xynogen/pix-9router
pi install npm:@xynogen/pix-data
```

## Development

```bash
bun install        # install all workspace deps
bun test           # run all tests
bun run typecheck  # tsc across all packages
```

## Publishing

```bash
bun run publish:dry   # verify what would be published
bun run publish:all   # publish every package to npm
```

## License

MIT
