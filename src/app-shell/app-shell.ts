import {withController} from '@snar/lit';
import {LitElement, html} from 'lit';
import {withStyles} from 'lit-with-styles';
import {customElement} from 'lit/decorators.js';
import {materialShellLoadingOff} from 'material-shell';
import {F, store} from '../store.js';
import styles from './app-shell.css?inline';
import {jsPDF} from 'jspdf';

const A4ratio = 1 / Math.sqrt(2);
const A4containerWidthPx = 595.28;

declare global {
	interface Window {
		app: AppShell;
	}
	interface HTMLElementTagNameMap {
		'app-shell': AppShell;
	}
}

@customElement('app-shell')
@withStyles(styles)
@withController(store)
export class AppShell extends LitElement {
	firstUpdated() {
		materialShellLoadingOff.call(this);
	}

	render() {
		return html`<!-- -->
			<div class="flex flex-wrap">
				<div class="flex flex-col">
					<div
						id="a4"
						class="bg-white overflow-auto h-full box-border"
						_style="width:${A4containerWidthPx}px;height:calc(${A4containerWidthPx}px / ${A4ratio});outline:1px solid black;"
						style="width:${A4containerWidthPx}px;aspect-ratio: 210 / 297;padding:${store.paddingPx}px;"
					>
						<div
							class="flex flex-wrap"
							style="gap:${store.gapPx}px;opacity:${store.opacity};"
						>
							${store.input
								.split(/,|\//)
								.map((v) => v.trim())
								.map(
									(word) =>
										html`<div
											jp
											style="font-size:${store.fontSizePx}px;font-weight:${store.fontWeight};"
										>
											${word}
										</div>`,
								)}
						</div>
					</div>
					<div id="actions" class="p-3">
						<md-filled-tonal-button @click=${() => this.#convertToPdf()}>
							<md-icon slot="icon">download</md-icon>
							Convert to PDF
						</md-filled-tonal-button>
					</div>
				</div>

				<div id="settings" class="flex flex-col gap-8 m-8 flex-1">
					${F.TEXTAREA('Words', 'input', {rows: 2})}
					${F.SLIDER('Gap', 'gapPx', {min: 1, max: 200})}
					${F.SLIDER('Font size', 'fontSizePx', {min: 10, max: 500})}
					${F.SLIDER('Font Weight', 'fontWeight', {min: 200, max: 900})}
					${F.SLIDER('Opacity', 'opacity', {min: 0.01, max: 1, step: 0.01})}
					${F.SLIDER('Padding', 'paddingPx', {min: 0, max: 1000})}
				</div>
			</div>
			<!-- -->`;
	}

	#convertToPdf() {
		html2canvas(this.renderRoot.querySelector('#a4')).then((canvas) => {
			// Crée une instance de jsPDF
			const pdf = new jsPDF();

			// Convertit le canvas en image
			const imgData = canvas.toDataURL('image/png', 100);

			// Dimensions de la page PDF
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = pdf.internal.pageSize.getHeight();

			// Utilise toute la page PDF pour l'image
			const imgWidth = pdfWidth;
			const imgHeight = pdfHeight;

			// Ajoute l'image au PDF à (0, 0) pour commencer au coin supérieur gauche
			pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

			// Sauvegarde le PDF
			pdf.save('capture.pdf');
		});
	}
}

export const app = (window.app = new AppShell());
