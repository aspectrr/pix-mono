# pix-skills

Pi coding agent extension — skill loader tool + skills bundle.

## What's included

| Resource | Type | Description |
|---|---|---|
| `read_skills` | tool | Browse and load bundled skills. No args → list all. `name` only → description. `name + full=true` → full instructions. |
| `skills/` | skills | 26 bundled skills (auto-loaded by pi at startup — names + descriptions in system prompt) |

## How it works

Pi loads skill *descriptions* into the system prompt at startup (progressive disclosure). Full content
only enters context when the agent calls `read_skills(name=<skill>, full=true)` — or reads the file via the `read` tool.

Skills are also discovered from `~/.pi/agent/skills/` (user-level). Bundled skills take precedence on name collision.

`read_skills` is the safe version of "agent prompts itself":

- Agent calls tool explicitly — no autonomous injection
- Orchestrator (user or system prompt) decides when skill loading is appropriate
- Auditable: tool call is visible in the conversation

## Skills

All skills are model-invocable — pi auto-loads each one on description match. The agent can also load any skill on demand via `read_skills(name=<skill>, full=true)`.

| Skill | Description |
|---|---|
| `ask-user` | Present 2–5 options before high-stakes/irreversible or ambiguous decisions |
| `audit` | Security audit, integrity check, and secret/vulnerability scan |
| `bootstrap` | Project and tool scaffolding from authoritative docs |
| `brainstorm` | Design exploration and spec refinement before implementation |
| `clone` | Clone any git repo into `/tmp/clones` for read-only exploration |
| `commit` | Split, write, and maintain Conventional-Commit-style commits |
| `debug` | Root-cause analysis and self-annealing error resolution |
| `explain` | Technical deconstruction and logic tracing of existing code |
| `finish` | Structured branch completion — verify, decide, clean up |
| `graphify` | Codebase questions via a persistent knowledge graph |
| `handoff` | Toggle session handoff — write or read+delete `HANDOFF.md` |
| `notion` | Efficient Notion workspace retrieval — pages, databases, lists |
| `plan` | Write detailed, bite-sized implementation plans before coding |
| `readme` | Create or update a deployment-focused README in a fixed style |
| `review` | Architectural review and quality assurance |
| `runner` | Generate or convert a task runner (just/make/mise/task/npm/sh) |
| `search` | Deep logic discovery and project context mapping |
| `standup` | Prepare a daily standup update from Notion context |
| `suggest` | Multi-dimensional optimization and improvement recommendations |
| `task` | Task orchestration and ambiguity resolution |
| `test` | Test execution, analysis, and failure resolution via TDD |
| `tldr` | Maximum-density technical summary, zero filler |
| `toon` | Handle information-dense JSON with jq + TOON compression |
| `ui` | UI/UX design and implementation guidance for frontends |
| `verify` | Verification before completion — confirm it's actually fixed |
| `subagent` | Plan, decompose, and fan out independent units to cheaper parallel subagent workers |

## Usage

```
# Agent lists available skills (no args)
read_skills()

# Agent reads description of a specific skill
read_skills(name="commit")

# Agent loads full commit procedure
read_skills(name="commit", full=true)
```

## Install

```bash
pi install npm:@xynogen/pix-skills
```

Or from the monorepo:

```bash
pi install ./packages/pix-skills
```

## Full distro

To install the complete pix suite (all packages + Pi itself):

```bash
curl -fsSL https://raw.githubusercontent.com/xynogen/pix-mono/main/scripts/install.sh | sh
```

## License

MIT
