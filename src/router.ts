import {ReactiveController, state} from '@snar/lit';
import {installRouter} from 'pwa-helpers';

export enum Page {
	HOME,
	SESSION,
}

class Router extends ReactiveController {
	@state() page: Page = Page.HOME;

	navigateComplete = Promise.resolve();

	constructor() {
		super();
		installRouter(async (location) => {
			this.navigateComplete = new Promise(async (resolve) => {
				const hash = location.hash.slice(1);
				const params = new URLSearchParams(hash);
				// do something
				resolve();
			});
		});
	}
}

export const router = new Router();
