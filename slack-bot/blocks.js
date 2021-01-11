const PLAIN_TEXT = text => ({ type: 'plain_text', text, emoji: true });

const MARKDOWN = text => ({ type: 'mrkdwn', text });

export const HEADER = text => ({ type: 'header', text: PLAIN_TEXT(text) });

export const DIVIDER = { type: 'divider' };

export const BUTTON = (label, value, action_id, url) => ({
	type: 'button',
	text: PLAIN_TEXT(label),
	value,
	action_id,
	url,
});

export const OVERFLOW = (options, action_id) => ({
	type: 'overflow',
	options: options.map(({ text, value }) => ({ text: PLAIN_TEXT(text), value })),
	action_id,
});

export const SELECT = (placeholder, options, action_id) => ({
	type: 'static_select',
	placeholder: PLAIN_TEXT(placeholder),
	action_id,
	options: options.map(option => ({
		text: { type: 'plain_text', text: option.text, emoji: true },
		value: option.value,
	})),
});

export const IMAGE = (url, title) => ({
	type: 'image',
	...(title && { title: PLAIN_TEXT(title || url) }),
	image_url: url,
	alt_text: title || url,
});

export const DATEPICKER = (placeholder, initial_date, action_id) => ({
	type: 'datepicker',
	initial_date,
	placeholder: PLAIN_TEXT(placeholder),
	action_id,
});

export const TIMEPICKER = (placeholder, initial_time, action_id) => ({
	type: 'timepicker',
	initial_time,
	placeholder: PLAIN_TEXT(placeholder),
	action_id,
});

export const CHECKBOXES = (options, action_id) => ({
	type: 'checkboxes',
	options: options.map(({ text, description, value }) => ({
		text: MARKDOWN(text),
		...(description && { description: MARKDOWN(description) }),
		value,
	})),
	action_id,
});

export const RADIOBUTTONS = (options, action_id) => ({
	type: 'radio_buttons',
	options: options.map(({ text, value }) => ({ text: PLAIN_TEXT(text), value })),
	action_id,
});

export const SECTION = (text, accessory) => ({ type: 'section', text: MARKDOWN(text), accessory });

export const FIELDS = fields => ({ type: 'section', fields });

export const ACTIONS = elements => ({ type: 'actions', elements });

export const CONTEXT = elements => ({ type: 'context', elements });
