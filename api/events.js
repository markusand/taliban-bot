import SlackBot from '../slack-bot';

const regex = {
	GREETING: /^(ho+la+!*\s*)+$|^(Bo+n dia+!*\s*)+$|^(e+i+\s*!*)+$|^(bo+ne+s!*)$/i,
	EMOJIS: /^\s*(:[^:\s]+:\s*)+$/,
	LAUGH: /^((h|j)+(a|e|i)+(j|h)*\s*){2,}!*$/i,
	CONFORMITY: /^(o+k(?:e+y+)*!*|va+le+!*\s*)+$/i,
};

export default new SlackBot(bot => {
	bot.onEvent('channel_created', async ({ channel }) => {
		await bot.client.post('conversations.join', { channel: channel.id });
	});

	bot.onMessage(regex.GREETING, async ({ user }) => {
		await bot.whisper(`No ens perdem en formalismes, <@${user}>. Directe al gra!`);
	});

	bot.onMessage(regex.EMOJIS, async ({ text }) => {
		await bot.whisper('Les reaccions a missatges es van inventar per no haver de fer servir els emojis així.\nInclus jo sé fer-ho!');
		const emojis = text.split(':').filter(part => part.trim());
		await bot.react(emojis);
	});

	bot.onMessage(regex.LAUGH, async () => {
		await bot.whisper("Jo no tinc sentit de l'humor, però si he de riure faig servir les reaccions. Tu també hauries.");
		await bot.react(['laughing', 'rolling_on_the_floor_laughing', 'joy', 'sweat_smile']);
	});

	bot.onMessage(regex.CONFORMITY, async ({ text }) => {
		await bot.whisper(`Per acabar dient _${text}_ millor utilitza una reacció.`);
		await bot.react(['ok', 'ok_hand', 'thumbsup', 'top']);
	});

	bot.onMessage('taliban', async ({ user }) => {
		await bot.respond(`És bo saber que sóc tant popular, <@${user}>. _Allahu akbar_!`);
	});

	bot.onMention(async ({ user }) => {
		const { SECTION, IMAGE } = bot.blocks;
		await bot.respond([
			SECTION(`Infidel <@${user}>, pronunciant el nom del profeta en va!`),
			IMAGE('https://i.gifer.com/76jQ.gif'),
			SECTION('Oh espera... això era _Mahoma_, no jo. Perdó.'),
		]);
	});
});
