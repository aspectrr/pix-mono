# pix-9router

Pi coding agent extension — **9Router provider** + **fetch** and **search** tools backed by an internal OpenAI-compatible router API.

## What's included

| Module | Type | Description |
|---|---|---|
| `provider` | provider | Registers `9router` provider with live model list from the router API |
| `fetch` | tool | `fetch(url, format, max_characters?)` — fetches web pages via exa through the router, falls back to curl |
| `search` | tool | `search(query, search_type, max_results?)` — web/news search via exa through the router, falls back to curl |

## Install

```bash
pi install git:github.com/xynogen/pix-9router
```

## Environment

| Variable | Required | Default | Description |
|---|---|---|---|
| `ROUTER_API_KEY` | Yes | — | Bearer token for the router API |
| `ROUTER_API_BASE` | No | `https://9router.example.com/v1` | Override router base URL |

Add to your `~/.zsh_local` (or equivalent):

```bash
export ROUTER_API_KEY="your-key-here"
# export ROUTER_API_BASE="https://your-router.example.com/v1"  # optional
```

## How it works

- **Provider**: on load, fetches `/models` from the router and registers them with Pi. [models.dev](https://models.dev/api.json) is used internally to fill missing context window / modality fields where the router response omits them. Model list is cached at `~/.cache/pi/9router.json` (TTL 1h).
- **fetch / search**: POST to `/web/fetch` and `/search` on the router (which proxies to exa). If the router is unreachable, falls back to raw `curl`.

## License

MIT
