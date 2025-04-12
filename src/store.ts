import {ReactiveController, state} from '@snar/lit';
import {saveToLocalStorage} from 'snar-save-to-local-storage';
import {FormBuilder} from './forms/FormBuilder.js';

@saveToLocalStorage('print-words-list')
export class AppStore extends ReactiveController {
	@state() input: string = '';
	@state() paddingPx = 12;
	@state() fontSizePx = 12;
	@state() fontWeight = 400;
	@state() gapPx = 12;
	@state() opacity = 0.4;
}

const store = new AppStore();
const F = new FormBuilder(store);
export {store, F};
