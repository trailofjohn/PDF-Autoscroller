import {App, PluginSettingTab, Setting, SliderComponent, TextComponent} from "obsidian";
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

		let sliderComponent: SliderComponent;
		let textComponent: TextComponent;

		const updateComputedScrollSpeed = () => {
			if (this.plugin.settings.useWpm) {
				// roughly WPM / 60 since 60WPM is around 1 pixel tick
				const computed = Math.max(1, Math.round(this.plugin.settings.wpm / 60));
				if (sliderComponent) sliderComponent.setValue(computed);
				if (textComponent) textComponent.setValue(computed.toString());
			}
		};

		const initComputedScrollSpeed = this.plugin.settings.useWpm 
			? Math.max(1, Math.round(this.plugin.settings.wpm / 60)) 
			: this.plugin.settings.scrollSpeed;

		let scrollSetting = new Setting(containerEl)
			.setName('Scroll Speed')
			.setDesc(this.plugin.settings.useWpm 
				? 'Locked to WPM equivalent speed.' 
				: 'Manual scroll speed (1 - 100). Use slider or mouse wheel over the input.')
			.addSlider(slider => {
				sliderComponent = slider;
				slider.setLimits(1, 100, 1);
				slider.setValue(initComputedScrollSpeed);
				slider.sliderEl.style.width = "250px";
				
				// Real-time update logic while dragging the thumb
				slider.sliderEl.addEventListener('input', (evt) => {
					const val = (evt.target as HTMLInputElement).value;
					if (textComponent) textComponent.setValue(val);
				});

				slider.onChange(async (value) => {
					this.plugin.settings.scrollSpeed = value;
					if (textComponent) textComponent.setValue(value.toString());
					await this.plugin.saveSettings();
				})
			})
			.addText(text => {
				textComponent = text;
				text.inputEl.type = "number";
				text.inputEl.min = "1";
				text.inputEl.max = "100";
				text.inputEl.style.width = "60px";
				text.setValue(initComputedScrollSpeed.toString())
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num)) {
							this.plugin.settings.scrollSpeed = num;
							if (sliderComponent) sliderComponent.setValue(num);
							await this.plugin.saveSettings();
						}
					})
			});
			
		scrollSetting.settingEl.style.opacity = this.plugin.settings.useWpm ? "0.5" : "1";
		scrollSetting.settingEl.style.pointerEvents = this.plugin.settings.useWpm ? "none" : "auto";

		new Setting(containerEl)
			.setName('Use Words Per Minute (WPM)')
			.setDesc('Override manual slider with a calculated reading speed')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useWpm)
				.onChange(async (value) => {
					this.plugin.settings.useWpm = value;
					await this.plugin.saveSettings();
					this.display(); // re-rendering the whole tab is fine on toggles
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
							updateComputedScrollSpeed(); // update visually without losing focus
						}
					})
			});
		
		wpmSetting.settingEl.style.opacity = this.plugin.settings.useWpm ? "1" : "0.5";
		wpmSetting.settingEl.style.pointerEvents = this.plugin.settings.useWpm ? "auto" : "none";
	}
}
