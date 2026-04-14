import {App, Notice, Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, PDFAutoscrollerSettings, PDFAutoscrollerSettingTab} from "./settings";

export default class PDFAutoscrollerPlugin extends Plugin {
	settings: PDFAutoscrollerSettings;
	scrollInterval: number | null = null;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon. 'chevrons-up' points upwards.
		this.addRibbonIcon('chevrons-up', 'Toggle PDF Autoscroll', (evt: MouseEvent) => {
			this.toggleAutoscroll();
		});

		this.addCommand({
			id: 'toggle-pdf-autoscroll',
			name: 'Toggle PDF Autoscroll',
			callback: () => {
				this.toggleAutoscroll();
			}
		});

		this.addSettingTab(new PDFAutoscrollerSettingTab(this.app, this));
	}

	toggleAutoscroll() {
		if (this.scrollInterval) {
			this.stopAutoscroll();
			new Notice('PDF Autoscroll stopped');
		} else {
			// Find active view
			const leaf = this.app.workspace.activeLeaf;
			// check if it's a pdf view. Obsidian's pdf view type is usually 'pdf'
			if (!leaf || leaf.view.getViewType() !== 'pdf') {
				new Notice('No active PDF view found. Please focus a PDF file first.');
				return;
			}
			
			// Obsidian uses a pdf.js viewer. 
			// Usually the scrollable element has class 'pdf-viewer-container' or we can fallback to the view's container.
			// It may also be `.pdf-container` or similar. Let's find any scrollable child.
			let container: Element | null = leaf.view.containerEl.querySelector('.pdf-viewer-container') 
			                              || leaf.view.containerEl.querySelector('.pdf-viewer') 
			                              || leaf.view.containerEl.querySelector('div[data-mode="scroll"]') 
			                              || leaf.view.containerEl;
			
			if (!container) return;

			new Notice('PDF Autoscroll started');
			this.scrollInterval = window.setInterval(() => {
				// if view changes or closed, stop
				if (this.app.workspace.activeLeaf !== leaf) {
					this.stopAutoscroll();
					return;
				}
				container!.scrollBy({ top: this.settings.scrollSpeed, behavior: 'auto' });
			}, 50); // ~20fps
		}
	}

	stopAutoscroll() {
		if (this.scrollInterval) {
			window.clearInterval(this.scrollInterval);
			this.scrollInterval = null;
		}
	}

	onunload() {
		this.stopAutoscroll();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<PDFAutoscrollerSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
