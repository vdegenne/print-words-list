import gamectrl, {
	getMode,
	Modes,
	setStateGamepad,
	XBoxButton,
} from 'esm-gamecontroller.js';
import {cquerySelector} from 'html-vision';

function shouldNotExecute() {
	if (!document.hasFocus()) {
		return true;
	}
	const speakerTest = document.querySelector<HTMLElement>('speaker-test');
	if (speakerTest && speakerTest.hasAttribute('open')) {
		return true;
	}
	return false;
}
function guard(callback: Function) {
	return function () {
		if (shouldNotExecute()) {
			return;
		}
		callback();
	};
}

gamectrl.on('connect', async (gamepad) => {
	gamepad.axeThreshold = [0.3];
	setStateGamepad(gamepad);
	function register(
		button: XBoxButton,
		callback: (mode: Modes) => void,
		type: 'before' | 'on' = 'before'
	) {
		gamepad[type](
			button,
			guard(() => {
				const mode = getMode();
				const buttonEl = getButtonElement(button);
				switch (mode) {
					case Modes.NORMAL:
						cquerySelector(`[gp-button="${button}"]`)?.click();
						break;

					case Modes.PRIMARY:
						cquerySelector(`[gp-primary-button="${button}"]`)?.click();
						break;

					case Modes.SECONDARY:
						cquerySelector(`[gp-secondary-button="${button}"]`)?.click();
						break;

					case Modes.TERTIARY:
						cquerySelector(`[gp-tertiary-button="${button}"]`)?.click();
						break;
				}
				callback(mode);
			})
		);
	}

	register(XBoxButton.UP, (mode) => {});
	register(XBoxButton.DOWN, (mode) => {});
	register(XBoxButton.LEFT, (mode) => {});
	register(XBoxButton.RIGHT, (mode) => {});

	register(XBoxButton.A, (mode) => {});
	register(XBoxButton.B, (mode) => {});
	register(XBoxButton.X, (mode) => {});
	register(XBoxButton.Y, (mode) => {});

	register(XBoxButton.DPAD_UP, (mode) => {});
	register(XBoxButton.DPAD_DOWN, (mode) => {});
	register(XBoxButton.DPAD_LEFT, (mode) => {});
	register(XBoxButton.DPAD_RIGHT, (mode) => {});

	register(XBoxButton.LEFT_BUMPER, (mode) => {});
	register(XBoxButton.RIGHT_BUMPER, (mode) => {});

	register(XBoxButton.RIGHT_STICK_UP, (mode) => {});
	register(XBoxButton.RIGHT_STICK_DOWN, (mode) => {});
	register(XBoxButton.RIGHT_STICK_LEFT, (mode) => {});
	register(XBoxButton.RIGHT_STICK_RIGHT, (mode) => {});
});
