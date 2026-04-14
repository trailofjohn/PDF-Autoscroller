import {App, PluginSettingTab, Setting} from "obsidian";
import PDFAutoscrollerPlugin from "./main";

export interface PDFAutoscrollerSettings {
	scrollSpeed: number;
}

export const DEFAULT_SETTINGS: PDFAutoscrollerSettings = {
	scrollSpeed: 1
}

export class PDFAutoscrollerSettingTab extends PluginSettingTab {
	plugin: PDFAutoscrollerPlugin;

	constructor(app: App, plugin: PDFAutoscrollerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Scroll Speed')
			.setDesc('Pixels to scroll per frame')
			.addSlider(slider => slider
				.setLimits(1, 10, 1)
				.setValue(this.plugin.settings.scrollSpeed)
				.onChange(async (value) => {
					this.plugin.settings.scrollSpeed = value;
					await this.plugin.saveSettings();
				}));
	}
}
