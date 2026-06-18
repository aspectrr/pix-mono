import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import modelPickerExtension from "./models.ts";

export default function (pi: ExtensionAPI): void {
	modelPickerExtension(pi);
}
