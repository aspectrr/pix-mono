import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import {
	buildModelsDevIndex,
	lookupBenchmark,
	lookupInIndex,
	lookupModelsDev,
	type ModelGrepModel,
	modelgrep,
} from "./data.ts";

// Compact modelgrep-shaped fixture builder.
function mg(
	id: string,
	opts: {
		name?: string;
		ctx?: number;
		in?: number;
		out?: number;
		reasoning?: boolean;
		input?: string[];
		// Raw benchmark inputs to codingScore. intelligence (~0–65) wins when
		// present; otherwise coding/agentic (0–100) + rest (0–1) feed the heuristic.
		bench?: {
			intelligence?: number;
			coding?: number;
			agentic?: number;
			gpqa?: number;
			scicode?: number;
			tau2?: number;
			hle?: number;
		};
	} = {},
): ModelGrepModel {
	return {
		id,
		name: opts.name ?? id,
		context_length: opts.ctx,
		pricing: { input: opts.in, output: opts.out },
		modality: { input: opts.input },
		capabilities: { reasoning: opts.reasoning },
		benchmarks: { artificial_analysis: { ...opts.bench } },
	};
}

// ── buildModelsDevIndex ──────────────────────────────────────────────────────

describe("buildModelsDevIndex", () => {
	const catalog: ModelGrepModel[] = [
		mg("anthropic/claude-sonnet-4-5", { name: "Claude Sonnet 4.5" }),
		mg("anthropic/claude-opus-4", { name: "Claude Opus 4", reasoning: true }),
		mg("openai/gpt-4o", { name: "GPT-4o", input: ["text", "image"] }),
	];

	it("indexes all models by slug", () => {
		const idx = buildModelsDevIndex(catalog);
		expect(idx.has("claude-sonnet-4-5")).toBe(true);
		expect(idx.has("claude-opus-4")).toBe(true);
		expect(idx.has("gpt-4o")).toBe(true);
	});

	it("indexes normalized slug (strip date suffix)", () => {
		const idx = buildModelsDevIndex([
			mg("anthropic/claude-sonnet-4-5-20250514", { name: "Claude Sonnet 4.5" }),
		]);
		expect(idx.has("claude-sonnet-4-5")).toBe(true);
	});

	it("handles empty catalog", () => {
		expect(buildModelsDevIndex([]).size).toBe(0);
	});

	it("maps fields onto ModelsDevModel shape", () => {
		const m = buildModelsDevIndex([
			mg("openai/gpt-4o", { ctx: 128000, in: 5, out: 15, input: ["text"] }),
		]).get("gpt-4o");
		expect(m?.limit?.context).toBe(128000);
		expect(m?.cost?.input).toBe(5);
		expect(m?.cost?.output).toBe(15);
		expect(m?.modalities?.input).toEqual(["text"]);
	});

	it("preserves first-seen on slug collision", () => {
		const idx = buildModelsDevIndex([
			mg("a/gpt-4o", { name: "First" }),
			mg("b/gpt-4o", { name: "Second" }),
		]);
		expect(idx.get("gpt-4o")?.name).toBe("First");
	});
});

// ── lookupInIndex ────────────────────────────────────────────────────────────

describe("lookupInIndex", () => {
	const index = buildModelsDevIndex([
		mg("anthropic/claude-sonnet-4-5", { name: "Claude Sonnet 4.5" }),
		mg("anthropic/claude-opus-4", { name: "Claude Opus 4" }),
		mg("openai/gpt-4o", { name: "GPT-4o" }),
		mg("openai/o3-mini", { name: "o3 mini" }),
	]);

	it("finds exact match", () => {
		expect(lookupInIndex("claude-sonnet-4-5", index)?.name).toBe(
			"Claude Sonnet 4.5",
		);
	});

	it("strips provider prefix (provider/model)", () => {
		expect(lookupInIndex("anthropic/claude-opus-4", index)?.name).toBe(
			"Claude Opus 4",
		);
	});

	it("strips deep prefix (cc/model)", () => {
		expect(lookupInIndex("cc/claude-opus-4", index)?.name).toBe(
			"Claude Opus 4",
		);
	});

	it("strips date suffix", () => {
		expect(lookupInIndex("claude-sonnet-4-5-20250514", index)?.name).toBe(
			"Claude Sonnet 4.5",
		);
	});

	it("strips provider prefix + date suffix", () => {
		expect(
			lookupInIndex("anthropic/claude-sonnet-4-5-20250514", index)?.name,
		).toBe("Claude Sonnet 4.5");
	});

	it("returns undefined for unknown model", () => {
		expect(lookupInIndex("nonexistent-xyz", index)).toBeUndefined();
	});

	it("finds o3-mini", () => {
		expect(lookupInIndex("o3-mini", index)?.name).toBe("o3 mini");
	});
});

// ── modelgrep adapters (lookupModelsDev + lookupBenchmark) ────────────────────

describe("modelgrep adapters", () => {
	const catalog: ModelGrepModel[] = [
		mg("anthropic/claude-haiku-4.5", {
			name: "Anthropic: Claude Haiku 4.5",
			ctx: 200000,
			in: 1,
			out: 5,
			input: ["text", "image"],
			bench: {
				coding: 43.9,
				agentic: 16.4,
				gpqa: 0.672,
				scicode: 0.433,
				tau2: 0.547,
				hle: 0.097,
			},
		}),
		mg("tencent/hy3-preview", {
			name: "Tencent: hy3 preview",
			ctx: 256000,
			in: 0,
			out: 0,
			reasoning: true,
			// coding/agentic absent — only raw benches → renormalized over present
			bench: { gpqa: 0.732, scicode: 0.394, tau2: 0.675, hle: 0.063 },
		}),
		mg("ghost/unbenched", { name: "Ghost" }), // no signal at all
	];

	beforeEach(() => {
		(modelgrep as unknown as { _mem: ModelGrepModel[] })._mem = catalog;
	});
	afterEach(() => {
		(modelgrep as unknown as { _mem: ModelGrepModel[] | null })._mem = null;
	});

	it("lookupModelsDev finds haiku via slug, ignoring routing prefix + date", () => {
		const m = lookupModelsDev("cc", "claude-haiku-4-5-20251001");
		expect(m?.limit?.context).toBe(200000);
		expect(m?.cost?.input).toBe(1);
	});

	it("lookupModelsDev finds hy3 via prefix + suffix strip", () => {
		expect(
			lookupModelsDev("openrouter", "tencent/hy3-preview:nitro")?.limit
				?.context,
		).toBe(256000);
	});

	it("lookupModelsDev returns undefined for unknown model", () => {
		expect(lookupModelsDev("cc", "nonexistent-xyz")).toBeUndefined();
	});

	it("lookupBenchmark falls back to fitted heuristic (no intelligence)", () => {
		const b = lookupBenchmark("claude-haiku-4-5-20251001");
		// no intelligence → 120.6·heur − 10.6 → 42
		expect(b?.overallScore).toBe(42);
		expect(b?.rank).toBe(2); // ranked by score: hy3 (58) > haiku (42)
		expect(b?.inputPrice).toBe(1);
		expect(b?.outputPrice).toBe(5);
	});

	it("lookupBenchmark renormalizes heuristic over present benches", () => {
		const b = lookupBenchmark("tencent/hy3-preview:nitro");
		// coding/agentic indices absent → heuristic renormalizes → fitted → 58
		expect(b?.overallScore).toBe(58);
		expect(b?.rank).toBe(1);
	});

	it("lookupBenchmark returns null score when no benches at all", () => {
		const b = lookupBenchmark("ghost/unbenched");
		expect(b?.overallScore).toBeNull();
		expect(b?.rank).toBe(3); // unscored sinks to the bottom
	});

	it("lookupBenchmark prefers AA intelligence index over heuristic", () => {
		(modelgrep as unknown as { _mem: ModelGrepModel[] })._mem = [
			mg("openai/gpt-5", { bench: { intelligence: 52, coding: 10 } }),
		];
		const b = lookupBenchmark("gpt-5");
		// intelligence present → round(52 / 65 * 100) = 80, ignores low coding
		expect(b?.overallScore).toBe(80);
	});

	it("lookupBenchmark returns undefined for unknown model", () => {
		expect(lookupBenchmark("nonexistent-model-xyz")).toBeUndefined();
	});
});
