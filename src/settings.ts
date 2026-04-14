import {App, PluginSettingTab, Setting} from "obsidian";
import PDFAutoscrollerPlugin from "./main";

export interface PDFAutoscrollerSettings {
	scrollSpeed: number;
	useWpm: boolean;
	wpm: number;
}

export const DEFAULT_SETTINGS: PDFAutoscrollerSettings = {
	scrollSpeed: 10,
	useWpm: false,
	wpm: 250
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
			.setDesc('Manual scroll speed (1 - 100). Use your mouse wheel over the input to adjust.')
			.addText(text => {
				text.inputEl.type = "number";
				text.inputEl.min = "1";
				text.inputEl.max = "100";
				text.setValue(this.plugin.settings.scrollSpeed.toString())
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num)) {
							this.plugin.settings.scrollSpeed = num;
							await this.plugin.saveSettings();
						}
					})
			});

		new Setting(containerEl)
			.setName('Use Words Per Minute (WPM)')
			.setDesc('Override manual manual slider with a calculated reading speed')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useWpm)
				.onChange(async (value) => {
					this.plugin.settings.useWpm = value;
					await this.plugin.saveSettings();
					this.display();
				}));

		let wpmSetting = new Setting(containerEl)
			.setName('Words Per Minute')
			.setDesc('Average reading speed to target (approximate calculation for PDFs)')
			.addText(text => {
				text.inputEl.type = "number";
				text.inputEl.min = "50";
				text.setValue(this.plugin.settings.wpm.toString())
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num)) {
							this.plugin.settings.wpm = num;
							await this.plugin.saveSettings();
						}
					})
			});
		
		wpmSetting.settingEl.style.opacity = this.plugin.settings.useWpm ? "1" : "0.5";
		wpmSetting.settingEl.style.pointerEvents = this.plugin.settings.useWpm ? "auto" : "none";
	}
}
