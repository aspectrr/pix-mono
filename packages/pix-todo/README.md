# pix-todo

Pi tool — durable execution checklist (`todo`).

## What it does

Registers the `todo` tool, which gives the agent a persistent task checklist that survives context compaction and session restore. The checklist is seeded by the model via the `set` action and tracks items through four statuses: `pending` (○), `in_progress` (◐), `done` (●), and `blocked` (⊘). State is persisted via Pi's `appendEntry("todo-state")` so the agent can recover its position after long runs or compaction events. The agent calls `todo(action:"list")` to resume where it left off. Actions: `list`, `set`, `add`, `update`, `clear`.

## Install

```bash
pi install npm:@xynogen/pix-todo
```

## Full distro

Source: [github.com/xynogen/pix-mono](https://github.com/xynogen/pix-mono)

To install the complete pix suite (all packages + Pi itself):

```bash
curl -fsSL https://raw.githubusercontent.com/xynogen/pix-mono/main/scripts/install.sh | sh
```

## License

MIT
