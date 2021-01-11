import axios from 'axios';
import validateRequestSignature from './validate-request-signature';
import * as blocks from './blocks';
import { isString, array } from './utils';

const { SLACK_BOT_TOKEN, SLACK_VERIFICATION_TOKEN } = process.env;

export default class SlackBot {
	constructor(queryHandler) {
		return async (req, res) => {
			this.req = req;
			this.res = res;
			this.blocks = blocks;
			this.tasks = [];

			this.client = axios.create({
				baseURL: 'https://slack.com/api/',
				headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
			});

			// Verify Slack Events API request URL
			const { token, type, challenge } = req.body || {};
			if (type === 'url_verification' && token === SLACK_VERIFICATION_TOKEN) {
				return res.send(challenge);
			}

			const isSigned = await validateRequestSignature(req);
			if (isSigned) queryHandler(this);

			// Wait for all tasks to finish before closing the connection
			// by sending a 200 OK response to the Slack Events API query
			await Promise.all(this.tasks);
			return res.send();
		};
	}

	/* EVENT HANDLERS */
	/**
	 * Catch event and execute a handler function
	 * @param  {String}		event   Event name https://api.slack.com/events
	 * @param  {Function} handler Function to execute when event is catched
	 */
	event(event, handler) {
		const { bot_id, type } = this.req.body.event;
		if (!bot_id && type === event) {
			this.setTask(handler(this.req.body.event));
		}
	}

	/**
	 * Shortcut for received message event
	 * @param  {RegExp}   pattern   Text in message that triggers handler
	 * @param  {Function} handler		Function to execute
	 */
	message(pattern, handler) {
		this.event('message', event => {
			if (event.text?.match(pattern)) return handler(event);
			return false;
		});
	}

	/* Shortcut for bot mention event */
	mention(handler) {
		this.event('app_mention', event => handler(event));
	}

	/* ACTIONS */
	/**
	 * Send a message
	 * @param  {Any}			message	Message to send. Can be a String or a (array of) block
	 * @param  {Object}		options	https://api.slack.com/methods/chat.postMessage#arguments
	 * @return {Promise}					Event info of the posted message
	 */
	async say(message, options) {
		const { channel } = this.req.body.event;
		const content = isString(message) ? { text: message } : { blocks: array(message) };
		const data = { channel, ...options, ...content };
		const response = await this.client.post('chat.postMessage', data);
		return response.data;
	}

	/**
	 * Shortcut to post a message as a thread response
	 * @param  {Any}			message	Message to respond. Can be a String or a (array of) block
	 * @param  {Object}		options	https://api.slack.com/methods/chat.postMessage#arguments
	 * @return {Promise}					Event info of the posted message
	 */
	async respond(message, options) {
		const { channel, thread_ts, ts } = this.req.body.event;
		return this.say(message, { channel, thread_ts: thread_ts || ts, ...options });
	}

	/**
	 * Post a silent message "only seen by you"
	 * @param  {Any}		message	Message text to post
	 * @param  {Object}	options	https://api.slack.com/methods/chat.postEphemeral#arguments
	 * @return {Promise}				Event info of the posted message
	 */
	async whisper(message, options) {
		const { channel, user } = this.req.body.event;
		const content = isString(message) ? { text: message } : { blocks: array(message) };
		const data = { channel, user, ...options, ...content };
		const response = await this.client.post('chat.postEphemeral', data);
		return response.data;
	}

	/**
	 * Add a reaction to a message
	 * @param  {Array}	emojis	List of emoji alias https://www.webfx.com/tools/emoji-cheat-sheet/
	 * @param  {Object}	options	https://api.slack.com/methods/reactions.add#arguments
	 * @return {Promise}				Event info of the reactions
	 */
	async react(emojis, options) {
		const { channel, ts: timestamp } = this.req.body.event;
		const reactions = array(emojis).map(name => {
			const data = { channel, timestamp, ...options, name };
			return this.client.post('reactions.add', data);
		});
		const responses = await Promise.all(reactions);
		return responses.map(({ data }) => data);
	}

	/**
	 * Get the permalink from a message
	 * @param  {String}	channel			Channel where the message was posted
	 * @param  {String}	message_ts	Timestamp when the message was posted
	 * @return {Promise}						Message permalink
	 */
	async getMessageLink(channel, ts) {
		const { channel: reqChannel, ts: reqTs } = this.req.body.event;
		const querystring = `channel=${channel || reqChannel}&message_ts=${ts || reqTs}`;
		const response = await this.client.get(`chat.getPermalink?${querystring}`);
		return response.data.permalink;
	}

	/**
	 * Store a task to be finished before the connection can be closed
	 * Must be used on every event handler
	 * @param {Function} task Async function to complete
	 */
	setTask(task) {
		this.tasks.push(new Promise(resolve => resolve(task)));
	}
}
