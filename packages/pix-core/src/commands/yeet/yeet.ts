import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const YEET_PROMPT = `Commit the current repository changes.

Steps:
1. Add all unstaged changes with \`git add -A\`.
2. Inspect the staged changes and write a concise commit message that accurately summarizes them.
3. Commit the changes with that message.
   - If there are no staged changes, output "Nothing to commit" and stop.

Keep the commit message concise. Do not push.`;

export default function (pi: ExtensionAPI) {
	pi.registerCommand("yeet", {
		description: "Add and commit current repo changes (no push)",
		handler: async (args, ctx) => {
			const prompt = args?.trim()
				? `${YEET_PROMPT}\n\nAdditional instructions from the user:\n${args.trim()}`
				: YEET_PROMPT;

			if (ctx.isIdle()) {
				pi.sendUserMessage(prompt);
			} else {
				pi.sendUserMessage(prompt, { deliverAs: "followUp" });
				ctx.ui.notify("Queued /yeet as a follow-up", "info");
			}
		},
	});
}
