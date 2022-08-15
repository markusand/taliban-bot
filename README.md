# SlackBot for Vercel functions

Simple class to leverage the creation of a Slack bot with Vercel functions.

## Get started

Clone this repo and install dependencies

```bash
git clone https://github.com/markusand/serverless-slack-bot.git
npm install
```

Create a `.env` file with credentials from [Slack API](https://api.slack.com/apps)

```env
SLACK_VERIFICATION_TOKEN=
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
```

Create a `/api` directory and add as many javascript files as serverless functions wanted. More info at [Vercel docs](https://vercel.com/docs/serverless-functions/introduction).

Load SlackBot and start receiving events and sending messages:

```js
import SlackBot from '../slack-bot';

export default new SlackBot(bot => {
  bot.onMessage('Hello', async ({ user }) => {
    await bot.say(`...world. OK <@${user}>, we have to stop doing this :wink:`);
  });
});
```

Install [Vercel CLI](https://vercel.com/download) and init dev environment

```bash
npm i -g vercel
vercel dev
```

Make localhost accessible for Slack API with [ngrok](https://ngrok.com/download)

```bash
ngrok http 3000
```

Verify the URL provided by ngrok under [Slack app](https://api.slack.com/apps) > Features > Event Subscriptions > Enable Events > Request URL

:tada: Enjoy interacting with Slack and your Slack bot!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/vercel/vercel/tree/master/examples/custom-build)

## API

An instance of SlackBot must be exported as serverless function handler. SlackBot exposes a `bot` reference to itself that allows to use its methods.

```js
export default new SlackBot(bot => {
  // Use bot methods
});
```

### Listeners

#### bot.onEvent(event, callback)

Execute a callback function whenever the specified event is triggered by Slack API

```js
bot.onEvent('app_mention', async event => {
  console.log(event);s
});
```

The callback receives the [Event type](https://api.slack.com/events-api#event_type_structure) object from Slack. You can use any of its values to return an action. The callback function will be generally async, as it will trigger other async functions such as other async API calls.

#### bot.onMessage(find, callback)

> Shortcut for **bot.onEvent('message')**.

Listens to message events and triggers the callback when the given pattern is found. You can use regular expressions as pattern.

```js
bot.onMessage(/^\s*(:[^:\s]+:\s*)+$/, async event => {
  // Triggered by message with only emojis
  console.log(event);
});
```

#### bot.onMention(callback)

> Shortcut for **bot.onEvent('app_mention')**

Listens for mentions to bot from other users

### Actions

#### bot.say(message, options)

Send a public message to the given channel. Message can be a string, a [Slack Layout Block](https://api.slack.com/reference/block-kit/blocks) or an array of blocks. Options may contain any of the postMessage [arguments](https://api.slack.com/methods/chat.postMessage#arguments), but none of them is required and default to the current request values.

All response methods are asyncronous and must be awaited.

```js
await bot.say('I was about to tell a joke, but I am a boring bot');
```

#### bot.respond(message, options)

> Shortcut for **bot.say(message, { thread_ts: 'xxxx' })**

Send a message as a thread response

#### bot.whisper(message, options)

Send an ephemeral message, only visible to the target user

#### bot.react(emojis, options)

Add reaction(s) to a message. Parameters must be any [emoji alias](https://www.webfx.com/tools/emoji-cheat-sheet/)

```js
await bot.react(['clap', 'top']);
```

### Blocks

SlackBot provides a serie of [layout blocks](https://api.slack.com/reference/block-kit/blocks) generators to simplify the creation of complex response layouts, accessible through `bot.blocks` object.

| TYPE | Parameters |
| --- | --- |
| Divider | |
| Header | (text) |
| Button | (label, value, action_id _[, url]_) |
| Overflow | (options, action_id) |
| Select | (placeholder, options, action_id) |
| Image | (url _[, title]_) |
| Datepicker | (placeholder, initial_date, action_id) |
| Timepicker | (placeholder, initial_time, action_id) |
| Checkboxes | (options, action_id) |
| Radiobuttons | (options, action_id) |
| Section | (text _[, accessory]_) |
| Actions | (elements) |
| Context | (elements) |

```js
const { Iimage, Section, Actions, Button } = bot.blocks;
const img = Image('https://media.giphy.com/media/m2Q7FEc0bEr4I/giphy.gif');
const blocks = [
  Section(`Wait <@${user}>, this is a long action, are you sure?`, img),
  Actions([
    Button('Accept', 'accept', 'action-accept'),
    Button('Cancel', 'cancel', 'action-canceñ'),
  ]),
];
await bot.say(blocks);
```

### Utils

#### getMessageLink(channel, ts)

Return the permalink of a message specified by its channel and timestamp; it defaults to the event message if none is provided.

```js
const link = await bot.getMessageLink();
```
