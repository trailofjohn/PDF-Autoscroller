import {App, Notice, Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, PDFAutoscrollerSettings, PDFAutoscrollerSettingTab} from "./settings";

export default class PDFAutoscrollerPlugin extends Plugin {
	settings: PDFAutoscrollerSettings;
	requestAnimationFrameId: number | null = null;
	lastTime: number = 0;
	accumulatedScroll: number = 0;
	activeScrollContainer: Element | null = null;
	activeLeafIdentifier: any = null;

	async onload() {
		await this.loadSettings();

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
		if (this.requestAnimationFrameId !== null) {
			this.stopAutoscroll();
			new Notice('PDF Autoscroll stopped');
		} else {
			const leaf = this.app.workspace.activeLeaf;
			// check if it's a pdf view. Obsidian's pdf view type is usually 'pdf'
			if (!leaf || leaf.view.getViewType() !== 'pdf') {
				new Notice('No active PDF view found. Please focus a PDF file first.');
				return;
			}
			
			// Obsidian uses a pdf.js viewer. 
			// Usually the scrollable element has class 'pdf-viewer-container' or we can fallback to the view's container.
			this.activeScrollContainer = leaf.view.containerEl.querySelector('.pdf-viewer-container') 
			                              || leaf.view.containerEl.querySelector('.pdf-viewer') 
			                              || leaf.view.containerEl.querySelector('div[data-mode="scroll"]') 
			                              || leaf.view.containerEl;
			
			if (!this.activeScrollContainer) return;

			new Notice('PDF Autoscroll started');
			this.activeLeafIdentifier = leaf;
			this.lastTime = performance.now();
			this.accumulatedScroll = 0;
			this.requestAnimationFrameId = window.requestAnimationFrame(this.scrollLoop);
		}
	}

	scrollLoop = (time: number) => {
		if (!this.activeScrollContainer || this.requestAnimationFrameId === null) return;

		// if view changes or closed, stop
		if (this.app.workspace.activeLeaf !== this.activeLeafIdentifier) {
			this.stopAutoscroll();
			return;
		}

		let pixelsPerSecond: number;
		if (this.settings.useWpm) {
			// Approximate: 4 pixels per word on a standard desktop view.
			pixelsPerSecond = (this.settings.wpm / 60) * 4;
		} else {
			// Map 1-100 setting to an appropriate smooth pixel range (4 to 400 pixels per sec)
			pixelsPerSecond = this.settings.scrollSpeed * 4;
		}

		const dt = (time - this.lastTime) / 1000;
		this.lastTime = time;

		// Cap max dt in case Tab is hidden or frozen (prevent giant scroll jumps)
		if (dt > 0.5) {
			this.requestAnimationFrameId = window.requestAnimationFrame(this.scrollLoop);
			return;
		}

		this.accumulatedScroll += pixelsPerSecond * dt;
		const scrollAmount = Math.floor(this.accumulatedScroll);

		if (scrollAmount > 0) {
			this.activeScrollContainer.scrollBy({ top: scrollAmount, left: 0, behavior: 'instant' });
			this.accumulatedScroll -= scrollAmount;
		}

		this.requestAnimationFrameId = window.requestAnimationFrame(this.scrollLoop);
	}

	stopAutoscroll() {
		if (this.requestAnimationFrameId !== null) {
			window.cancelAnimationFrame(this.requestAnimationFrameId);
			this.requestAnimationFrameId = null;
		}
		this.activeScrollContainer = null;
		this.activeLeafIdentifier = null;
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
