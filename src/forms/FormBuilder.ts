import {type MdChipSet} from '@material/web/chips/chip-set.js';
import {type MdFilterChip} from '@material/web/chips/filter-chip.js';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {createRef, type Ref, ref} from 'lit/directives/ref.js';
import {
	literal,
	html as staticHtml,
	type StaticValue,
} from 'lit/static-html.js';
import {bindInput} from './bindInput.js';
import '../material/outlined-field-patch.js';

interface SharedOptions {
	autofocus: boolean;
}

type InputOptions = {
	availableValues: string[];
};

export class FormBuilder<T> {
	constructor(protected host: T) {}

	TEXTFIELD(label: string, key: keyof T, options?: Partial<TextFieldOptions>) {
		return TEXTFIELD(label, this.host, key, options);
	}

	TEXTAREA(label: string, key: keyof T, options?: Partial<TextFieldOptions>) {
		return TEXTAREA(label, this.host, key, options);
	}

	SWITCH(headline: string, key: keyof T, options?: Partial<SwitchOptions>) {
		return SWITCH(headline, this.host, key, options);
	}

	SLIDER(label: string, key: keyof T, options?: Partial<SliderOptions>) {
		return SLIDER(label, this.host, key, options);
	}

	SELECT(label: string, key: keyof T, choices: string[]) {
		return SELECT(label, this.host, key, choices);
	}

	FILTER(
		label: string,
		key: keyof T,
		choices: string[],
		options?: Partial<FilterOptions>,
	) {
		return FILTER(label, this.host, key, choices, options);
	}
}

interface SwitchOptions extends SharedOptions {
	overline: string | undefined;
	supportingText: string | undefined;
}

export const SWITCH = <T>(
	headline: string,
	host: T,
	key: keyof T,
	options?: Partial<SwitchOptions>,
) => {
	const _options: SwitchOptions = {
		autofocus: false,
		supportingText: undefined,
		overline: undefined,
		...options,
	};
	return html`
		<md-list-item
			type="button"
			@click=${() => {
				(host[key] as boolean) = !host[key];
			}}
			class="select-none cursor-pointer flex items-center gap-3"
			style="--md-list-item-top-space:var(--forms-switch-padding);--md-list-item-bottom-space:var(--forms-switch-padding);--md-list-item-leading-space:var(--forms-switch-padding);--md-list-item-trailing-space:var(--forms-switch-padding);"
		>
			<md-switch slot="start" ?selected=${host[key]} inert></md-switch>
			${_options.overline
				? html` <div slot="overline">${_options.overline}</div> `
				: null}
			<div slot="headline">${headline}</div>
			${_options.supportingText
				? html` <div slot="supporting-text">${_options.supportingText}</div> `
				: null}
		</md-list-item>
	`;
};

interface SliderOptions extends SharedOptions {
	min: number;
	max: number;
	step: number;
}

export const SLIDER = <T>(
	label: string,
	host: T,
	key: keyof T,
	options?: Partial<SliderOptions>,
) => {
	const _options: SliderOptions = {
		autofocus: false,
		min: 0,
		max: 10,
		step: 1,
		...options,
	};

	return html`
		<div class="flex items-center gap-3 flex-1">
			<span>${label}</span>
			<md-slider
				class="flex-1"
				ticks
				labeled
				min=${_options.min}
				max=${_options.max}
				step=${_options.step}
				${bindInput(host, key)}
			>
			</md-slider>
		</div>
	`;
};

export const SELECT = <T>(
	label: string,
	host: T,
	key: keyof T,
	choices: string[] = [],
) => html`
	<md-filled-select quick value=${host[key]} label=${label}>
		<md-select-option></md-select-option>
		${choices.map(
			(item, id) => html`
				<md-select-option value=${id}>${item}</md-select-option>
			`,
		)}
		<md-option></md-option>
	</md-filled-select>
`;

interface TextFieldOptions extends SharedOptions {
	// TODO: find a generic type for input type
	type: 'text' | 'number' | 'textarea';
	/**
	 * For `:not([type=textarea])` inputs only.
	 */
	suffixText: string | undefined;
	/** @default 'outlined' */
	style: 'filled' | 'outlined';
	/**
	 * Number of rows when the type is "textarea"
	 * @default 2
	 */
	rows: number;

	/**
	 * @default true
	 */
	resetButton: boolean;
}

export const TEXTFIELD = <T>(
	label: string,
	host: T,
	key: keyof T,
	options?: Partial<TextFieldOptions>,
) => {
	const _options: TextFieldOptions = {
		autofocus: false,
		type: 'text',
		suffixText: undefined,
		style: 'outlined',
		rows: 2,
		resetButton: true,
		...options,
	};
	let style: StaticValue;
	switch (_options.style) {
		case 'filled':
			import('@material/web/textfield/filled-text-field.js');
			style = literal`filled`;
			break;

		case 'outlined':
			import('@material/web/textfield/outlined-text-field.js');
			style = literal`outlined`;
			break;
	}
	return staticHtml`
		<md-${style}-text-field
			class="flex-1"
			?autofocus=${_options.autofocus}
			label=${label.replace(/\*/g, '')}
			type=${_options.type}
			.rows=${_options.rows}
			value=${host[key]}
			${bindInput(host, key)}
			?required=${label.includes('*')}
			suffix-text=${ifDefined(_options.suffixText)}
		>
			${
				_options.resetButton
					? html`<md-icon-button
							slot="trailing-icon"
							@click=${() => {
								(host[key] as string) = '';
							}}
							><md-icon>clear</md-icon></md-icon-button
						>`
					: null
			}
		</md-${style}-text-field>
	`;
};

export const TEXTAREA = <T>(
	label: string,
	host: T,
	key: keyof T,
	options?: Partial<TextFieldOptions>,
) => TEXTFIELD(label, host, key, {...options, type: 'textarea'});

export const FilterBehavior = {
	ZeroOrMore: 'zero-or-more',
	OneOrMore: 'one-or-more',
	OnlyOne: 'only-one',
} as const;
export type FilterBehaviorValue =
	(typeof FilterBehavior)[keyof typeof FilterBehavior];

interface FilterOptions extends SharedOptions {
	/**
	 * You can also import and use FilterBehavior enum for clean code :)
	 *
	 * @default 'zero-or-more'
	 */
	behavior: FilterBehaviorValue;
	/**
	 * @default string
	 */
	type: 'string' | 'number';
	/**
	 * Not implemented yet.
	 */
	sort: 'none' | 'alphabet';

	/**
	 * @default false
	 */
	elevated: boolean;
}
type StringOrNumber = string | number;

export const FILTER = <T>(
	label: string,
	host: T,
	key: keyof T,
	choices: string[],
	options?: Partial<FilterOptions>,
) => {
	const _options: FilterOptions = {
		autofocus: false,
		behavior: FilterBehavior.ZeroOrMore,
		sort: 'none',
		type: 'string',
		elevated: false,
		...(options ?? {}),
	};
	const _choices = choices
		.map((choice, index) => ({value: choice, index})) // Create an array of objects with value and original index
		.sort((a, b) => {
			switch (_options.sort) {
				case 'alphabet':
					return a.value.localeCompare(b.value); // Sort alphabetically based on value
				default:
					return 0; // No sorting (return original order)
			}
		});
	const chipsetref: Ref<MdChipSet> = createRef();
	return html`
		<div>
			${label ? html` <div class="mb-4">${label}</div>` : null}
			<md-chip-set
				class="justify-stretch"
				?autofocus=${_options.autofocus}
				${ref(chipsetref)}
				@click=${async (event: PointerEvent) => {
					const chipset = chipsetref.value!;
					const chips = chipset.chips as MdFilterChip[];
					const chip = event.target as MdFilterChip;
					const chipIndex = chips.indexOf(chip);
					if (chipIndex === -1) {
						// clicked outside
						return;
					}
					const getSelectedChip = () => chips.filter((c) => c.selected);
					switch (_options.behavior) {
						case 'one-or-more':
							if (getSelectedChip().length === 0) {
								event.preventDefault();
								return;
							}
							break;

						case 'only-one':
							chips.forEach((c, index) => (c.selected = index === chipIndex));
							break;
					}
					const values = getSelectedChip().map((c) =>
						_options.type === 'string'
							? c.dataset.value
							: Number(c.dataset.index),
					);

					(host[key] as StringOrNumber | StringOrNumber[]) =
						_options.behavior === 'only-one' ? values[0] : values;
				}}
			>
				${_choices.map(
					(choice) => html`
						<md-filter-chip
							?elevated=${_options.elevated}
							?selected=${[]
								.concat(host[key] as StringOrNumber[])
								.includes(
									_options.type === 'string' ? choice.value : choice.index,
								)}
							data-value=${choice.value}
							data-index=${choice.index}
							label=${choice.value}
						></md-filter-chip>
					`,
				)}
			</md-chip-set>
		</div>
	`;
};

export const INPUT = <T>(
	label: string,
	host: T,
	key: keyof T,
	options?: Partial<InputOptions>,
) => {
	throw new Error('Not implemented yet.');
	return html`<!-- -->

		<!-- -->`;
};
