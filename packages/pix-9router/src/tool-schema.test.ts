import { describe, expect, test } from "bun:test";
import registerFetch from "./fetch.ts";
import registerSearch from "./search.ts";

function captureParameters(register: (pi: never) => void): {
	properties: Record<string, { type?: string; enum?: string[]; description?: string }>;
} {
	let parameters: unknown;
	register({
		registerTool(tool: { parameters: unknown }) {
			parameters = tool.parameters;
		},
	} as never);
	if (!parameters) throw new Error("tool parameters not captured");
	return parameters as {
		properties: Record<string, { type?: string; enum?: string[]; description?: string }>;
	};
}

describe("enum-like tool parameters", () => {
	test("search_type exposes values and their semantics", () => {
		const searchType = captureParameters(registerSearch).properties.search_type;
		if (!searchType) throw new Error("search_type schema not found");

		expect(searchType.type).toBe("string");
		expect(searchType.enum).toEqual(["web", "news"]);
		expect(searchType.description).toContain('exactly "web"');
		expect(searchType.description).toContain('"news"');
	});

	test("fetch format exposes values and their semantics", () => {
		const format = captureParameters(registerFetch).properties.format;
		if (!format) throw new Error("format schema not found");

		expect(format.type).toBe("string");
		expect(format.enum).toEqual(["markdown", "text", "html"]);
		expect(format.description).toContain('exactly "markdown"');
		expect(format.description).toContain('"html"');
	});
});
