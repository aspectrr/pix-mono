# pix-prompts

Pi extension — system-prompt injection (AGENT.md + repo directives).

## What it does

Injects structured context into the system prompt at the start of every agent turn via `before_agent_start`. Two sources are injected in order: the bundled `AGENT.md` (the pix agent operating spec baseline), followed by any repo-root directive files found in the current working directory (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursorrules`, `.windsurfrules`). Each source is wrapped in a labelled XML tag for provenance. Injection is idempotent — a source whose tag is already present in the system prompt is silently skipped, preventing double-injection on retry turns.

## Install

```bash
pi install npm:@xynogen/pix-prompts
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
