/**
 * Basic smoke tests for pix-tokyo-night theme
 */

import { describe, it, expect } from "bun:test";
import { existsSync } from "fs";
import { resolve } from "path";

describe("pix-tokyo-night", () => {
	it("theme directory exists", () => {
		const themesDir = resolve(__dirname, "../themes");
		expect(existsSync(themesDir)).toBe(true);
	});

	it("contains pix-tokyo-night theme file", () => {
		const themeFile = resolve(__dirname, "../themes/pix-tokyo-night.json");
		expect(existsSync(themeFile)).toBe(true);
	});
});
