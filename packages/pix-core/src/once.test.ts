import { afterEach, describe, expect, it } from "bun:test";
import registerTodo from "@xynogen/pix-todo/src/todo.ts";

// Mirror of the per-member guard. pix-core does not own once.ts (each member
// duplicates it to stay cross-dep-free), so we re-declare the contract here and
// assert the dedupe semantics that the aggregator relies on.
function once(key: string, fn: () => void): void {
	const g = globalThis as { __pixLoaded?: Set<string> };
	const loaded = (g.__pixLoaded ??= new Set<string>());
	if (loaded.has(key)) return;
	loaded.add(key);
	fn();
}

afterEach(() => {
	delete (globalThis as { __pixLoaded?: Set<string> }).__pixLoaded;
});

describe("once", () => {
	it("runs the factory on first invocation", () => {
		let calls = 0;
		once("pix-footer", () => {
			calls++;
		});
		expect(calls).toBe(1);
	});

	it("skips repeated invocations of the same key", () => {
		let calls = 0;
		const reg = () => {
			calls++;
		};
		once("pix-footer", reg);
		once("pix-footer", reg);
		once("pix-footer", reg);
		expect(calls).toBe(1);
	});

	it("isolates distinct keys", () => {
		const seen: string[] = [];
		once("pix-footer", () => seen.push("footer"));
		once("pix-welcome", () => seen.push("welcome"));
		expect(seen).toEqual(["footer", "welcome"]);
	});

	it("shares the registry across calls via globalThis", () => {
		let calls = 0;
		once("pix-skills", () => {
			calls++;
		});
		// A second loader pass (e.g. standalone install after pix-core) reuses
		// the same globalThis registry and must not re-run.
		once("pix-skills", () => {
			calls++;
		});
		expect(calls).toBe(1);
		expect(
			(globalThis as { __pixLoaded?: Set<string> }).__pixLoaded?.has(
				"pix-skills",
			),
		).toBe(true);
	});
});

// Behavior pin: prove a REAL guarded member dedupes when its factory runs
// twice — the exact scenario the aggregator creates when a tool is installed
// both via pix-core (this boots it) and standalone (Pi boots it again). The
// member must register its tool only once or Pi reports a tool conflict.
describe("member factory dedupe (pix-todo)", () => {
	function makeHost() {
		const toolNames: string[] = [];
		const pi = {
			registerTool(def: { name: string }) {
				toolNames.push(def.name);
			},
			appendEntry() {},
			on() {},
		} as never;
		return { pi, toolNames };
	}

	it("registers the tool once across core + standalone activation", () => {
		const { pi, toolNames } = makeHost();
		// First pass: pix-core's aggregator invokes the member factory.
		registerTodo(pi);
		// Second pass: standalone install loads the same module and invokes it
		// again. The globalThis once() registry must suppress re-registration.
		registerTodo(pi);
		expect(toolNames).toEqual(["todo"]);
	});
});
