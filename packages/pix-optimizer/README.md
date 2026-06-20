# pix-optimizer

Token-optimization suite for Pi Coding Agent. Three tools wired into one
extension via `src/index.ts`, fronted by a single `/opt` command and one
shared status-bar cell:

- **Caveman** (`󰜐`) — terse-output system prompt
- **RTK** (`󰓥`) — prefixes shell commands with `rtk` + injects RTK prompt
- **TOON** (`󰗀`) — jq + TOON guidance for dense JSON (skill lives in pix-skills)
- **Ponytail** (`󰆐`) — lazy-senior-dev system prompt (minimal code, YAGNI)

## Command

One command routes to every tool:

```text
/opt                  → status + help
/opt caveman <level>  → set caveman level (1/2/3/lite/full/ultra/micro/off/config)
/opt rtk [on|off]     → toggle RTK rewriting
/opt toon [on|off]    → toggle jq+TOON guidance
/opt ponytail <level> → set ponytail level (1/2/3/lite/full/ultra/off/config)
```

## Status bar

A single cell always shows the enabled icons in a fixed order (`󰜐 󰓥 󰗀 󰆐`), color-
coded by state: **accent** when the tool is enabled, **dim** when disabled.

## Features

### Caveman Mode (`󰜐`)

Cuts ~75% of output tokens while keeping full technical accuracy.

| # | Name  | Description                  |
|---|-------|------------------------------|
| 1 | lite  | Professional, no fluff       |
| 2 | full  | Classic caveman              |
| 3 | ultra | Maximum compression          |
| – | micro | Experimental prompt-minimized |

`/opt caveman config` opens a settings dialog. Default level for new sessions
and status-bar visibility are saved to `~/.pi/agent/caveman.json`.

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

| # | Name  | Description                          |
|---|-------|--------------------------------------|
| 1 | lite  | Name the lazier alternative, you pick |
| 2 | full  | The ladder enforced (default)        |
| 3 | ultra | YAGNI extremist                      |

`/opt ponytail config` opens a settings dialog. Default level for new sessions
and status-bar visibility are saved to `~/.pi/agent/ponytail.json`.

**No install required** — pure prompt injection, no external binary or PATH
dependency (unlike RTK and TOON).

## Installation

```bash
pi install npm:@xynogen/pix-optimizer
```

## Architecture

| File              | Role                                                      |
|-------------------|-----------------------------------------------------------|
| `src/index.ts`    | Wires the four tools + shared status, registers `/opt`    |
| `src/opt.ts`      | The `/opt` router: parse, complete, dispatch              |
| `src/status.ts`   | Shared status-bar cell + `OptimizerHandle` contract       |
| `src/caveman.ts`  | Caveman logic, levels, prompt, settings dialog            |
| `src/rtk.ts`      | RTK prompt + bash command rewriting                       |
| `src/json.ts`     | jq+TOON guidance, heuristics, system-prompt injection     |
| `src/ponytail.ts` | Ponytail logic, levels, prompt, settings dialog           |

Each tool registers its own lifecycle hooks and exposes an `OptimizerHandle`
that `/opt` dispatches to. All four share one `OptimizerStatus`.

## Development

```bash
bun test
```

## Origin

This package was built by merging two upstream Pi community packages:

- **Caveman mode** — merged from [`git:github.com/jonjonrankin/pi-caveman`](https://github.com/jonjonrankin/pi-caveman)
  (itself a fork of `npm:pi-caveman`). Reimplemented here with multiple compression levels,
  a settings dialog, per-session persistence, and integration with the shared `/opt` command.

- **RTK rewriting** — merged from `npm:pi-rtk-optimizer`. Reimplemented here with a two-layer
  approach: prompt injection + live bash command rewriting that handles chained commands
  (`&&`, `||`, `;`, `|`).

- **Ponytail mode** — ruleset adapted from [`git:github.com/DietrichGebert/ponytail`](https://github.com/DietrichGebert/ponytail),
  the "lazy senior dev" skill. Reimplemented here as a native `/opt` tool with three intensity
  levels, a settings dialog, and per-session persistence — no external hooks or files. The
  ruleset (the YAGNI ladder + safety carve-outs) is rewritten as a system-prompt fragment.

All upstreams are MIT licensed. No codebase was copied directly — the logic was
rewritten and combined into a single extension with a unified `/opt` command and shared status bar.
This package does not sync back to any upstream.

## Full distro

Source: [github.com/xynogen/pix-mono](https://github.com/xynogen/pix-mono)

To install the complete pix suite (all packages + Pi itself):

```bash
curl -fsSL https://raw.githubusercontent.com/xynogen/pix-mono/main/scripts/install.sh | sh
```

## License

MIT
