/**
 * todo.ts — durable execution checklist tool
 *
 * Extracted from the plan extension: the checklist is BUILD-phase execution
 * state that survives context compaction and session restore (persisted via
 * appendEntry("todo-state")). It is universal — other tools and workflow
 * extensions (like plan) drive it — so it lives in pix-core and registers the
 * `todo` tool. State, persistence, and restore are owned end to end here; the
 * checklist is seeded by the model via the tool's `set` action.
 */

import { Type } from "typebox";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export type TodoStatus = "pending" | "in_progress" | "done" | "blocked";

export interface TodoItem {
	id: number;
	text: string;
	status: TodoStatus;
}

const TODO_GLYPH: Record<TodoStatus, string> = {
	pending: "○",
	in_progress: "◐",
	done: "●",
	blocked: "⊘",
};

const parseItems = (raw: string): string[] =>
	raw
		.split("\n")
		.map((l) => l.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, "").trim())
		.filter(Boolean);

export default function registerTodo(pi: ExtensionAPI): void {
	let todos: TodoItem[] = [];
	let nextTodoId = 1;

	function persistTodos() {
		pi.appendEntry("todo-state", { todos, nextTodoId });
	}

	function todoSummary(): string {
		if (!todos.length) return "(no todos)";
		const done = todos.filter((t) => t.status === "done").length;
		const lines = todos.map((t) => `${TODO_GLYPH[t.status]} ${t.id}. ${t.text}`);
		return `Todos ${done}/${todos.length} done:\n${lines.join("\n")}`;
	}

	// Durable execution checklist for BUILD mode. Survives context compaction
	// and session restore. Workflows like plan instruct the model to seed it
	// from a plan's "Implementation Phases" so it stays anchored to plan.md.
	pi.registerTool({
		name: "todo",
		label: "Todo",
		description:
			"Track BUILD-phase execution progress. Durable across context compaction. Actions: list, set (replace all items from newline/numbered text), add, update (change one item's status), clear.",
		promptSnippet:
			"todo(action, items?, id?, status?, text?) — action: list|set|add|update|clear. Use to track implementation progress, especially when executing a plan.",
		promptGuidelines: [
			"When you start executing a multi-step plan in BUILD mode, seed the todo list with `todo(action:'set', items: <plan Implementation Phases>)`.",
			"Mark each item in_progress before working it and done when finished via `todo(action:'update', id, status)`.",
			"Call `todo(action:'list')` to recover your place after long runs or context compaction.",
		],
		parameters: Type.Object({
			action: Type.Union(
				[
					Type.Literal("list"),
					Type.Literal("set"),
					Type.Literal("add"),
					Type.Literal("update"),
					Type.Literal("clear"),
				],
				{ description: "Operation to perform" },
			),
			items: Type.Optional(
				Type.String({
					description:
						"For set/add: newline-separated or numbered list of todo texts.",
				}),
			),
			id: Type.Optional(
				Type.Number({ description: "For update: target todo id." }),
			),
			status: Type.Optional(
				Type.Union(
					[
						Type.Literal("pending"),
						Type.Literal("in_progress"),
						Type.Literal("done"),
						Type.Literal("blocked"),
					],
					{ description: "For update: new status." },
				),
			),
			text: Type.Optional(
				Type.String({
					description: "For update: replacement text (optional).",
				}),
			),
		}),
		async execute(_id, params) {
			switch (params.action) {
				case "list":
					return { content: [{ type: "text", text: todoSummary() }] };

				case "set": {
					const texts = parseItems(params.items ?? "");
					if (!texts.length)
						return {
							content: [
								{ type: "text", text: "set requires non-empty `items`." },
							],
							isError: true,
						};
					nextTodoId = 1;
					todos = texts.map((text) => ({
						id: nextTodoId++,
						text,
						status: "pending" as TodoStatus,
					}));
					persistTodos();
					return { content: [{ type: "text", text: todoSummary() }] };
				}

				case "add": {
					const texts = parseItems(params.items ?? "");
					if (!texts.length)
						return {
							content: [
								{ type: "text", text: "add requires non-empty `items`." },
							],
							isError: true,
						};
					for (const text of texts)
						todos.push({ id: nextTodoId++, text, status: "pending" });
					persistTodos();
					return { content: [{ type: "text", text: todoSummary() }] };
				}

				case "update": {
					const t = todos.find((x) => x.id === params.id);
					if (!t)
						return {
							content: [
								{ type: "text", text: `No todo with id ${params.id}.` },
							],
							isError: true,
						};
					if (params.status) t.status = params.status;
					if (params.text) t.text = params.text;
					persistTodos();
					return { content: [{ type: "text", text: todoSummary() }] };
				}

				case "clear":
					todos = [];
					nextTodoId = 1;
					persistTodos();
					return { content: [{ type: "text", text: "Todos cleared." }] };

				default:
					return {
						content: [
							{
								type: "text",
								text: `Unknown action: ${String(params.action)}`,
							},
						],
						isError: true,
					};
			}
		},
	});

	// Restore the checklist from session entries so it survives restart.
	pi.on("session_start", async (_event, ctx) => {
		const entries = ctx.sessionManager.getEntries() as Array<{
			type: string;
			customType?: string;
			data?: { todos?: TodoItem[]; nextTodoId?: number };
		}>;
		const lastTodo = entries
			.filter((e) => e.type === "custom" && e.customType === "todo-state")
			.pop();
		if (Array.isArray(lastTodo?.data?.todos)) {
			todos = lastTodo.data.todos;
			nextTodoId =
				lastTodo.data.nextTodoId ??
				todos.reduce((m, t) => Math.max(m, t.id + 1), 1);
		}
	});
}
