# pix-data

Pi coding agent extension — shared model data layer. Fetches and caches the
[modelgrep](https://modelgrep.com) model catalog to `~/.cache/pi/` on session
start, so other extensions (model picker, footer, subagent resolver) can read
context window, pricing, and a coding-focused score/rank synchronously without
redundant network calls.

## Data source

All data comes from a **single source**: [modelgrep.com](https://modelgrep.com)
(`/api/v1/models?benchmarked=1&sort=coding`). Free, no API key, ~190 benchmarked
models with real model ids. modelgrep aggregates benchmark numbers from
[Artificial Analysis](https://artificialanalysis.ai).

- **Context window + pricing** — taken verbatim from modelgrep.
- **Score** — computed locally from the raw benchmark fields (see below).
- **Rank** — the model's position once the whole catalog is sorted by that score
  (best = `#1`). Unscored models sink to the bottom.

Cached 24h → `~/.cache/pi/modelgrep.json`. On outage the stale cache keeps the
picker working until it can refresh.

## Scoring methodology

**Primary score = [Artificial Analysis Intelligence Index](https://artificialanalysis.ai/methodology/intelligence-benchmarking)**
when available — AA's authoritative composite of 9 independent evals (agents,
coding, scientific reasoning, general), already weighted toward agentic work.
It is rescaled to 0–100 (`intelligence / 65 × 100`; the current leader scores
~65).

**Fallback = a coding-and-agentic heuristic** for the ~84% of models AA has not
index-scored, computed from the raw benchmarks below, then mapped onto the index
scale by a least-squares line. Both the heuristic weights *and* the line were
jointly tuned against the index on the models that carry *both* it and the raw
benches (`index100 ≈ 120.6·heuristic − 10.6`, deduped n=29, R²=0.901,
leave-one-out RMSE 6.55pt) — a data calibration, not a guessed penalty. The
picker exists to choose a model *for coding work in an agent*, so the heuristic
is weighted toward exactly that:

| bench | range | measures |
|---|---|---|
| `coding` | 0–100 | code generation index |
| `scicode` | 0–1 | scientific coding |
| `tau2` | 0–1 | agentic tool-use |
| `agentic` | 0–100 | agentic index |
| `gpqa` | 0–1 | graduate-level reasoning |
| `hle` | 0–1 | hard-exam reasoning |

When the index is absent, three sub-scores combine, each a weighted blend of
its benches (all normalized to 0–1):

```
coding_score    = 0.60·(coding/100) + 0.40·scicode
agentic_score   = 0.70·tau2         + 0.30·(agentic/100)
reasoning_score = 0.60·gpqa         + 0.40·hle

heuristic = 0.30·coding_score + 0.60·agentic_score + 0.10·reasoning_score
score     = round(clamp₀₁₀₀(120.6·heuristic − 10.6))   // fitted to the index
```

**Why a heuristic at all, and why these raw evals only:** the AA Intelligence
Index *is* the ideal number — but only ~16% of the catalog has it. For the rest
we rebuild a comparable score from the same family of raw evals. Crucially we
use each raw eval **once** and never feed `intelligence` *and* its components
together, nor any `_pct` field (which is just a percentile-rank of a raw field)
— doing so would double-count the same measurement and silently inflate weights
you can't see. Independent inputs only → honest weighted average.

**Why these weights:** an agentic coding model lives or dies on *tool-calling*
and *code generation*, so `agentic_score` (0.60) and `coding_score` (0.30)
carry the score; pure reasoning (0.10) is a tiebreaker, not the headline. The
split is not arbitrary — a grid search over weight combinations, scored by how
well the heuristic predicts the AA index (leave-one-out cross-validation),
landed on this agentic-heavy mix. Within each group the dominant bench (`tau2`
for agentic, raw `coding`, `gpqa`) carries most of the weight and a secondary
bench refines it.

**Missing benchmarks:** every blend renormalizes over the fields actually
present, so a model missing one bench is diluted only *within its own group* —
it is never zero-penalized or dropped. A model with no benchmarks at all gets a
`null` score (shown as a bare row) and sorts to the bottom.

The exact implementation is `codingScore()` in
[`src/data.ts`](src/data.ts); the weights are intentionally easy to tune in one
place if your priorities differ.

## What's included

| Export | Description |
|---|---|
| `modelgrep` | `DataSource<ModelGrepModel[]>` — the catalog. TTL 24h → `~/.cache/pi/modelgrep.json` |
| `DataSource` | Generic cached data source class |
| `CACHE_DIR` | Resolved cache directory (`~/.cache/pi`) |
| `buildModelsDevIndex` | Build a lookup `Map` from the catalog (context/cost/modalities) |
| `lookupInIndex` | Fuzzy-match a router model id against an index |
| `lookupModelsDev` | Sync lookup by provider + id from in-memory cache |
| `lookupBenchmark` | Sync lookup a model by id — returns score + rank + pricing |

## Install

```bash
pi install npm:@xynogen/pix-data
```

## How it works

On session start the extension fires a background fetch (`modelgrep.get()`),
paginating the API until the full benchmarked catalog is retrieved. If the cache
is fresh the fetch is skipped. The cache file lives in `~/.cache/pi/` — any Pi
extension using the same `DataSource` shares it automatically.

## Full distro

Source: [github.com/xynogen/pix-mono](https://github.com/xynogen/pix-mono)

To install the complete pix suite (all packages + Pi itself):

```bash
curl -fsSL https://raw.githubusercontent.com/xynogen/pix-mono/main/scripts/install.sh | sh
```

## License

MIT
