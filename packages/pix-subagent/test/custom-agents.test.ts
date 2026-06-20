import { expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadCustomAgents } from "../src/custom-agents.ts";

test("loads a project .pi/agents/*.md with frontmatter", () => {
	const cwd = mkdtempSync(join(tmpdir(), "pixsa-"));
	mkdirSync(join(cwd, ".pi", "agents"), { recursive: true });
	writeFileSync(
		join(cwd, ".pi", "agents", "scout.md"),
		"---\ndescription: scout the code\ntools: read, grep, find\nmodel: haiku\n---\nYou are a scout.",
	);
	const agents = loadCustomAgents(cwd);
	const scout = agents.get("scout");
	expect(scout?.description).toBe("scout the code");
	expect(new Set(scout?.builtinToolNames)).toEqual(
		new Set(["read", "grep", "find"]),
	);
	expect(scout?.model).toBe("haiku");
	expect(scout?.systemPrompt).toBe("You are a scout.");
});
