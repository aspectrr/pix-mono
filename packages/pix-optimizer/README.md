# pix-optimizer

Token-optimization suite for Pi Coding Agent. Four tools wired into one
extension via `src/index.ts`, fronted by a single `/optimizer` command and one
shared status-bar cell:

- **Caveman** (`󰜐`) — terse-output system prompt
- **RTK** (`󰓥`) — prefixes shell commands with `rtk` + injects RTK prompt
- **TOON** (`󰗀`) — jq + TOON guidance for dense JSON (skill lives in pix-skills)
- **Ponytail** (`󰆐`) — lazy-senior-dev system prompt (minimal code, YAGNI)

## Command

One command opens an interactive overlay that fronts every tool:

```text
/optimizer                 → open the overlay (←→ cycle value, ↑↓ move, esc close)
```

There is no text-arg form: the overlay is the only UI. Selecting a value calls
the tool's `run()` handler, which persists the new value and repaints the
shared status cell. Headless/test fallbacks print a plain status summary.

State persists to `~/.pi/agent/optimizer.json` (caveman/rtk/toon/ponytail).

## Status bar

A single cell always shows the enabled icons in a fixed order (`󰜐 󰓥 󰗀 󰆐`), color-
coded by state: **accent** when the tool is enabled, **dim** when disabled.

## Features

### Caveman Mode (`󰜐`)

Cuts ~75% of output tokens while keeping full technical accuracy.

| Level | Description                  |
|-------|------------------------------|
| lite  | Professional, no fluff       |
| full  | Classic caveman              |
| ultra | Maximum compression          |
| micro | Experimental prompt-minimized |

The `/optimizer` overlay opens a settings dialog when needed. Default level
for new sessions is restored from `~/.pi/agent/optimizer.json`.

### RTK Tool Rewriting (`󰓥`)

Two layers, both active automatically:

1. **Prompt layer** — injects the RTK system prompt (tells the model to
   prefix commands with `rtk`).
2. **Execute layer** — rewrites `bash` tool calls, prefixing known commands
   (`git`, `gh`, `cargo`, `npm`, `pnpm`, `docker`, `kubectl`, `ls`, `grep`, …)
   with `rtk` when the model forgets. **Command chains are split on `&&`,
   `||`, `;` and `|`, and every known segment is prefixed** — e.g.
   `git add . && git push` becomes `rtk git add . && rtk git push`.
   Operators inside quotes are ignored, and unparseable commands are left
   untouched. Falls back gracefully when the `rtk` binary is missing
   (warns once).

**Requirement:** the `rtk` binary must be on `PATH`.

```bash
cargo install rtk-ai
```

### TOON / JSON Compression (`󰗀`)

Guidance for handling information-dense JSON via `jq` (query/reshape) and
`toon` (compress). The system-prompt nudge is injected **only when the user
prompt mentions JSON** (`json`/`jsonl`/`jq`/`toon`/`openapi`/…). TOON shines
on uniform/tabular arrays; deeply nested or array-of-arrays data and API
contracts stay as JSON.

The `toon-json` skill (full workflow + when-NOT-to-use guidance) is bundled in
`pix-skills` and auto-discovered from there.

**Requirement:** `jq` and `toon` on `PATH`.

```bash
npm i -g @toon-format/cli
```

### Ponytail Mode (`󰆐`)

"Lazy senior dev" mode. Governs **what** the agent builds (minimal code,
YAGNI), orthogonal to Caveman which governs **how** it talks — they pair. Before
writing code the agent stops at the first rung that holds: does this need to
exist → stdlib → native platform → installed dep → one line → minimum that
works. Validation, error handling, security, and accessibility are never cut.

| Level | Description                          |
|-------|--------------------------------------|
| lite  | Name the lazier alternative, you pick |
| full  | The ladder enforced (default)        |
| ultra | YAGNI extremist                      |

**No install required** — pure prompt injection, no external binary or PATH
dependency (unlike RTK and TOON).

## Installation

```bash
pi install npm:@xynogen/pix-optimizer
```

> Also included in [`@xynogen/pix-core`](https://www.npmjs.com/package/@xynogen/pix-core):
>
> ```bash
> pi install npm:@xynogen/pix-core
> ```

## Architecture

| File              | Role                                                      |
|-------------------|-----------------------------------------------------------|
| `src/index.ts`    | Wires the four tools + shared status, registers `/optimizer` |
| `src/opt.ts`      | The `/optimizer` overlay UI (keyboard nav + cycling)     |
| `src/status.ts`   | Shared status-bar cell + `OptimizerHandle` contract       |
| `src/caveman.ts`  | Caveman logic, levels, prompt                            |
| `src/rtk.ts`      | RTK prompt + bash command rewriting                       |
| `src/json.ts`     | jq+TOON guidance, heuristics, system-prompt injection     |
| `src/ponytail.ts` | Ponytail logic, levels, prompt                            |
| `src/persist.ts`  | Disk-backed `~/.pi/agent/optimizer.json` persistence      |
| `src/tool-result-filter.ts` | Strips model-guidance warnings from tool_result |

Each tool registers its own lifecycle hooks and exposes an `OptimizerHandle`
that `/optimizer` dispatches to. All four share one `OptimizerStatus`.

## Development

```bash
bun test
```

## Origin

This package was built by merging two upstream Pi community packages:

- **Caveman mode** — merged from `npm:pi-caveman`. Reimplemented here with
  multiple compression levels and integration with the shared `/optimizer`
  command.

- **RTK rewriting** — merged from `npm:pi-rtk-optimizer`. Reimplemented here
  with a two-layer approach: prompt injection + live bash command rewriting
  that handles chained commands (`&&`, `||`, `;`, `|`).

- **Ponytail mode** — ruleset adapted from [`git:github.com/DietrichGebert/ponytail`](https://github.com/DietrichGebert/ponytail),
  the "lazy senior dev" skill. Reimplemented here as a native `/optimizer`
  tool with three intensity levels — no external hooks or files. The
  ruleset (the YAGNI ladder + safety carve-outs) is rewritten as a system-prompt fragment.

All upstreams are MIT licensed. No codebase was copied directly — the logic was
rewritten and combined into a single extension with a unified `/optimizer`
command and shared status bar. This package does not sync back to any upstream.

## Full distro

Source: [github.com/xynogen/pix-mono](https://github.com/xynogen/pix-mono)

To install the complete pix suite (all packages + Pi itself):

```bash
curl -fsSL https://raw.githubusercontent.com/xynogen/pix-mono/main/scripts/install.sh | sh
```

## License

MIT
