# pix-data

Pi coding agent extension — shared model data layer. Fetches and caches [models.dev](https://models.dev) metadata and [BenchLM](https://benchlm.ai) leaderboard data to `~/.cache/pi/` on session start, so other extensions can read them synchronously without redundant network calls.

## What's included

| Export | Description |
|---|---|
| `modelsDev` | `DataSource<ModelsDevApi>` — models.dev metadata (context, cost, modalities). TTL 24h → `~/.cache/pi/models.json` |
| `benchmark` | `DataSource<BenchmarkEntry[]>` — BenchLM leaderboard (rank, score, pricing). TTL 24h → `~/.cache/pi/benchlm.json` |
| `DataSource` | Generic cached data source class |
| `CACHE_DIR` | Resolved cache directory (`~/.cache/pi`) |
| `buildModelsDevIndex` | Build a lookup `Map` from a `ModelsDevApi` response |
| `lookupInIndex` | Fuzzy-match a router model id against the index |
| `lookupModelsDev` | Sync lookup by provider + id from in-memory cache |
| `lookupBenchmark` | Fuzzy lookup a model by name from BenchLM cache |
| `fetchModelsDevIndex` | Async — fetch models.dev and return built index |

## Install

```bash
pi install git:github.com/xynogen/pix-data
```

## How it works

On session start the extension fires two parallel background fetches (`modelsDev.get()` + `benchmark.get()`). If the cache is fresh the fetches are skipped. Both cache files live in `~/.cache/pi/` — any Pi extension using the same `DataSource` + cache paths will share data automatically.

## License

MIT
