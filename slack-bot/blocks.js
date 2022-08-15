const PlainText = text => ({ type: 'plain_text', text, emoji: true });

const Markdown = text => ({ type: 'mrkdwn', text });

export const Header = text => ({ type: 'header', text: PlainText(text) });

export const Divider = { type: 'divider' };

export const Button = (label, value, action_id, url) => ({
	type: 'button',
	text: PlainText(label),
	value,
	action_id,
	url,
});

export const Overflow = (options, action_id) => ({
	type: 'overflow',
	options: options.map(({ text, value }) => ({ text: PlainText(text), value })),
	action_id,
});

export const Select = (placeholder, options, action_id) => ({
	type: 'static_select',
	placeholder: PlainText(placeholder),
	action_id,
	options: options.map(option => ({
		text: { type: 'plain_text', text: option.text, emoji: true },
		value: option.value,
	})),
});

export const Image = (url, title) => ({
	type: 'image',
	...(title && { title: PlainText(title || url) }),
	image_url: url,
	alt_text: title || url,
});

export const Datepicker = (placeholder, initial_date, action_id) => ({
	type: 'datepicker',
	initial_date,
	placeholder: PlainText(placeholder),
	action_id,
});

export const Timepicker = (placeholder, initial_time, action_id) => ({
	type: 'timepicker',
	initial_time,
	placeholder: PlainText(placeholder),
	action_id,
});

export const Checkboxes = (options, action_id) => ({
	type: 'checkboxes',
	options: options.map(({ text, description, value }) => ({
		text: Markdown(text),
		...(description && { description: Markdown(description) }),
		value,
	})),
	action_id,
});

export const Radiobuttons = (options, action_id) => ({
	type: 'radio_buttons',
	options: options.map(({ text, value }) => ({ text: PlainText(text), value })),
	action_id,
});

export const Section = (text, accessory) => ({ type: 'section', text: Markdown(text), accessory });

export const Fields = fields => ({ type: 'section', fields });

export const Actions = elements => ({ type: 'actions', elements });

export const Context = elements => ({ type: 'context', elements });
