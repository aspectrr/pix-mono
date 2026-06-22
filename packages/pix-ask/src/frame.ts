import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

const MIN_WIDTH = 40;
const MAX_WIDTH = 96;
const MARGIN = 4;
// 2 border cols + 2 padding spaces
const CHROME = 4;

export function modalWidth(termWidth: number): number {
	return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, termWidth - MARGIN));
}

export function frameLines(opts: {
	width: number;
	lines: string[];
	color: (s: string) => string;
	bg?: (s: string) => string;
	top?: string;
}): string[] {
	const { width, lines, color, top } = opts;
	const bg = opts.bg ?? ((s: string) => s);
	const inner = Math.max(1, width - CHROME);
	const dashes = "─".repeat(width - 2);

	// Derive the bg OPEN sequence so we can re-assert it after any full reset
	// (\x1b[0m) or bg reset (\x1b[49m) embedded in content — theme fg/bold spans
	// emit \x1b[0m, which would otherwise punch transparent holes in the fill.
	const SENTINEL = "\x00";
	const bgOpen = bg(SENTINEL).split(SENTINEL)[0] ?? "";
	const reassert = (s: string): string =>
		bgOpen
			? s.replace(/\x1b\[([0-9;]*)m/g, (seq, p: string) =>
					p === "0" || p.split(";").includes("49") ? `${seq}${bgOpen}` : seq,
				)
			: s;

	const row = (content: string): string => {
		const pad = inner - visibleWidth(content);
		const padded =
			pad > 0 ? content + " ".repeat(pad) : truncateToWidth(content, inner);
		return bg(`${color("│")} ${reassert(padded)} ${color("│")}`);
	};

	const out: string[] = [bg(color(`╭${dashes}╮`))];
	if (top !== undefined) out.push(row(top));
	for (const line of lines) out.push(row(line));
	out.push(bg(color(`╰${dashes}╯`)));
	return out;
}
