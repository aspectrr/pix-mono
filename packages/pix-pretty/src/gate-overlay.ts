/**
 * pix-pretty/gate-overlay — shared permission dialog component.
 *
 * One component, two modes:
 *   "confirm" — SelectList only. Used by pix-gate for command gating.
 *   "sudo"    — SelectList → masked password input. Used by pix-sudo.
 *
 * Both modes share: colored border, title, body lines, countdown.
 *
 * Design goals:
 *   - Pure function — no side effects, no global state.
 *   - Fully unit-testable: inject a mock `ui` to drive inputs deterministically.
 *   - Single source of truth for the overlay look across pix-gate and pix-sudo.
 */

import { DynamicBorder } from "@earendil-works/pi-coding-agent";
import {
	Box,
	Input,
	type SelectItem,
	SelectList,
	Text,
} from "@earendil-works/pi-tui";

// ── Types ─────────────────────────────────────────────────────────────────────

export type OverlayAction = "approved" | "denied" | "timeout";

export interface OverlayResult {
	action: OverlayAction;
	/** Only present when action === "approved" and mode === "sudo". */
	password?: string;
}

export interface OverlayChoice {
	value: string;
	label: string;
	description: string;
}

interface BaseConfig {
	/** Accent colour token (e.g. "error", "warning", "accent"). Default "accent". */
	accent?: string;
	/** Title shown bold at the top. */
	title: string;
	/** Optional body lines under the title. */
	body?: string[];
	/** Auto-deny after this many ms. 0 = no timeout. Default 30_000. */
	timeoutMs?: number;
	/**
	 * Choices shown in the SelectList.
	 * The choice whose value === approveValue counts as approval.
	 * Default: [{ value:"yes", label:"Allow" }, { value:"no", label:"Deny" }]
	 */
	choices?: OverlayChoice[];
	/** Which choice value means "approved". Default "yes". */
	approveValue?: string;
}

export interface ConfirmConfig extends BaseConfig {
	mode: "confirm";
}

export interface SudoConfig extends BaseConfig {
	mode: "sudo";
	/** Label for the password input hint. Default "Sudo password:" */
	passwordLabel?: string;
}

export type OverlayConfig = ConfirmConfig | SudoConfig;

// Minimal structural types — no hard dep on a specific Pi context shape.
interface OverlayTheme {
	fg(color: string, text: string): string;
	bg(color: string, text: string): string;
	bold(text: string): string;
}

interface OverlayTui {
	requestRender(): void;
}

interface OverlayComponent {
	render(width: number): string[];
	invalidate(): void;
	handleInput(data: string): void;
	focused?: boolean;
}

export interface OverlayUI {
	custom<T>(
		cb: (
			tui: OverlayTui,
			theme: OverlayTheme,
			kb: unknown,
			done: (v: T) => void,
		) => OverlayComponent,
		opts?: { overlay?: boolean },
	): Promise<T | undefined>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SECOND_MS = 1_000;
const COUNTDOWN_WARN_S = 5;
const DEFAULT_TIMEOUT_MS = 30_000;

const DEFAULT_CHOICES: OverlayChoice[] = [
	{ value: "yes", label: "Allow", description: "Proceed" },
	{ value: "no", label: "Deny", description: "Block" },
];

// ── Masked input (● per char) ─────────────────────────────────────────────────

class MaskedInput extends Input {
	override render(width: number): string[] {
		const real = this.getValue();
		this.setValue("●".repeat(real.length));
		const lines = super.render(width);
		this.setValue(real);
		return lines;
	}
}

// ── Main ──────────────────────────────────────────────────────────────────────

/**
 * Show a permission overlay and resolve the user's decision.
 *
 * @example — gate confirm
 * ```ts
 * const result = await showOverlay(ui, {
 *   mode: "confirm",
 *   title: "⚠️  DANGEROUS",
 *   body: ["rm -rf /tmp/work"],
 *   accent: "warning",
 *   timeoutMs: 30_000,
 *   choices: [
 *     { value: "yes", label: "Allow", description: "Run the command" },
 *     { value: "no",  label: "Deny",  description: "Block it"        },
 *   ],
 * });
 * ```
 *
 * @example — sudo prompt
 * ```ts
 * const result = await showOverlay(ui, {
 *   mode: "sudo",
 *   title: "🔐 ROOT COMMAND REQUEST",
 *   body: ["Intent: install package", "Command: apt install foo"],
 *   accent: "error",
 * });
 * if (result.action === "approved") runWithSudo(cmd, result.password!);
 * ```
 */
export function showOverlay(
	ui: OverlayUI,
	config: OverlayConfig,
): Promise<OverlayResult> {
	const accent = config.accent ?? "accent";
	const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
	const choices = config.choices ?? DEFAULT_CHOICES;
	const approveVal = config.approveValue ?? "yes";

	return new Promise((resolve) => {
		const controller = new AbortController();
		const timer =
			timeoutMs > 0
				? setTimeout(() => controller.abort(), timeoutMs)
				: undefined;

		ui.custom<OverlayResult>(
			(tui, theme, _kb, done) => {
				// ── state ───────────────────────────────────────────────────────
				type Stage = "select" | "password";
				let stage: Stage = "select";

				// ── components ──────────────────────────────────────────────────
				const selectItems: SelectItem[] = choices.map((c) => ({
					value: c.value,
					label: c.label,
					description: c.description,
				}));

				const selectList = new SelectList(selectItems, selectItems.length, {
					selectedPrefix: (t) => theme.fg(accent, t),
					selectedText: (t) => theme.fg(accent, t),
					description: (t) => theme.fg("muted", t),
					scrollInfo: (t) => theme.fg("dim", t),
					noMatch: (t) => theme.fg("warning", t),
				});

				const maskedInput = new MaskedInput();
				const passwordHint = new Text("", 1, 0);
				const helpText = new Text("", 1, 0);
				const countdownText = new Text("", 1, 0);

				// ── container ───────────────────────────────────────────────────
				// padding: 2 cols horizontal, 1 row vertical around all dialog content
				const container = new Box(2, 1, (s) => theme.bg("customMessageBg", s));
				container.addChild(
					new DynamicBorder((s: string) => theme.fg(accent, s)),
				);
				container.addChild(
					new Text(theme.fg(accent, theme.bold(config.title)), 1, 0),
				);

				for (const line of config.body ?? []) {
					container.addChild(new Text(theme.fg("text", line), 1, 0));
				}

				// ── countdown ───────────────────────────────────────────────────
				let ticker: ReturnType<typeof setInterval> | undefined;
				if (timeoutMs > 0) {
					const deadlineMs = Date.now() + timeoutMs;
					const updateCountdown = () => {
						const remaining = Math.max(
							0,
							Math.ceil((deadlineMs - Date.now()) / SECOND_MS),
						);
						countdownText.setText(
							theme.fg("dim", "Auto-deny in ") +
								theme.fg(
									remaining <= COUNTDOWN_WARN_S ? accent : "muted",
									`${remaining}s`,
								),
						);
					};
					updateCountdown();
					ticker = setInterval(() => {
						updateCountdown();
						tui.requestRender();
					}, SECOND_MS);
					container.addChild(countdownText);
				}

				// ── select stage (always starts here) ───────────────────────────
				helpText.setText(
					theme.fg("dim", "↑↓ navigate • enter select • esc deny"),
				);
				container.addChild(selectList);
				container.addChild(helpText);
				container.addChild(
					new DynamicBorder((s: string) => theme.fg(accent, s)),
				);

				// ── finish helper ────────────────────────────────────────────────
				const finish = (result: OverlayResult) => {
					if (timer !== undefined) clearTimeout(timer);
					if (ticker !== undefined) clearInterval(ticker);
					done(result);
				};

				// ── stage: password (sudo mode only) ────────────────────────────
				const switchToPassword = () => {
					stage = "password";
					container.removeChild(selectList);
					container.removeChild(helpText);

					const label =
						config.mode === "sudo"
							? (config.passwordLabel ?? "Sudo password:")
							: "Password:";
					passwordHint.setText(theme.fg("muted", label));
					container.addChild(passwordHint);
					container.addChild(maskedInput);
					container.addChild(
						new Text(theme.fg("dim", "enter confirm • esc cancel"), 1, 0),
					);
					tui.requestRender();
				};

				// ── event wiring ─────────────────────────────────────────────────
				selectList.onSelect = (item) => {
					if (item.value !== approveVal) {
						finish({ action: "denied" });
					} else if (config.mode === "sudo") {
						switchToPassword();
					} else {
						finish({ action: "approved" });
					}
				};
				selectList.onCancel = () => finish({ action: "denied" });

				maskedInput.onSubmit = (pw) =>
					finish({ action: "approved", password: pw });
				maskedInput.onEscape = () => finish({ action: "denied" });

				controller.signal.addEventListener("abort", () =>
					finish({ action: "timeout" }),
				);

				// ── component interface ──────────────────────────────────────────
				return {
					render: (w) => container.render(w),
					invalidate: () => container.invalidate(),
					handleInput: (data) => {
						if (stage === "select") selectList.handleInput(data);
						else maskedInput.handleInput(data);
						tui.requestRender();
					},
				};
			},
			{ overlay: true },
		).then((result) => {
			if (timer !== undefined) clearTimeout(timer);
			resolve(result ?? { action: "timeout" });
		});
	});
}
