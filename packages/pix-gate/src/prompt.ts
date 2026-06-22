/**
 * pix-gate — prompt.ts
 *
 * Thin adapter: maps gate severity/rule → showOverlay (pix-pretty).
 * All dialog logic lives in @xynogen/pix-pretty/gate-overlay.
 */

import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import {
	type OverlayResult,
	showOverlay,
} from "@xynogen/pix-pretty/gate-overlay";
import type { Rule } from "./lib.ts";

export interface GateDecision {
	approved: boolean;
	/** "Approved" | "Blocked by user" | "Timed out" */
	reason: string;
}

export type GatePromptUI = ExtensionContext["ui"];

const TIMEOUT_MS: Record<Rule["severity"], number> = {
	critical: 15_000,
	dangerous: 30_000,
	risky: 60_000,
};

const SEVERITY_COLOR: Record<Rule["severity"], string> = {
	critical: "error",
	dangerous: "warning",
	risky: "accent",
};

export const SEVERITY_ICON: Record<Rule["severity"], string> = {
	critical: "🛑",
	dangerous: "⚠️ ",
	risky: "❓",
};

/**
 * Show the confirm/deny dialog for a matched command.
 * Critical is deny-first; dangerous/risky are allow-first.
 */
export async function promptGateDecision(
	ui: GatePromptUI,
	hit: Rule,
	command: string,
): Promise<GateDecision> {
	const icon = SEVERITY_ICON[hit.severity];
	const label = hit.severity.toUpperCase();
	const accent = SEVERITY_COLOR[hit.severity];

	// critical: deny listed first so it's the default selected item
	const choices =
		hit.severity === "critical"
			? [
					{
						value: "no",
						label: "No, block it",
						description: "Prevent this command from running",
					},
					{
						value: "yes",
						label: "Yes, I understand the risk",
						description: "Allow once",
					},
				]
			: [
					{ value: "yes", label: "Yes, allow", description: "Run the command" },
					{
						value: "no",
						label: "No, block it",
						description: "Prevent this command from running",
					},
				];

	const result: OverlayResult = await showOverlay(
		ui as Parameters<typeof showOverlay>[0],
		{
			mode: "confirm",
			title: `${icon} ${label} — ${hit.reason}`,
			body: [command],
			accent,
			timeoutMs: TIMEOUT_MS[hit.severity],
			choices,
		},
	);

	if (result.action === "approved")
		return { approved: true, reason: "Approved" };
	if (result.action === "timeout")
		return { approved: false, reason: "Timed out" };
	return { approved: false, reason: "Blocked by user" };
}
