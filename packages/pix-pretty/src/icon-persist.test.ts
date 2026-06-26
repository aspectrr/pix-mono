import { afterAll, afterEach, beforeAll, describe, expect, it } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getIconMode, setIconMode } from "./icon-catalog.ts";
import { initIconMode, loadIconMode, saveIconMode } from "./icon-persist.ts";

let tmpAgentDir: string;

beforeAll(() => {
	tmpAgentDir = mkdtempSync(join(tmpdir(), "pretty-persist-test-"));
	process.env.PI_CODING_AGENT_DIR = tmpAgentDir;
});

afterAll(() => {
	delete process.env.PI_CODING_AGENT_DIR;
	try {
		rmSync(tmpAgentDir, { recursive: true });
	} catch {
		// already gone — ignore
	}
});

describe("icon-persist", () => {
	afterEach(() => setIconMode("nerd"));

	it("returns undefined before anything is saved", () => {
		expect(loadIconMode()).toBeUndefined();
	});

	it("round-trips a mode across save/load (new-session sim)", () => {
		saveIconMode("unicode");
		expect(loadIconMode()).toBe("unicode");
	});

	it("rejects an invalid persisted mode", () => {
		saveIconMode("ascii");
		expect(loadIconMode()).toBe("ascii");
	});

	it("initIconMode applies the persisted choice to the catalog", () => {
		saveIconMode("ascii");
		setIconMode("nerd"); // pretend env default
		initIconMode();
		expect(getIconMode()).toBe("ascii");
	});
});
