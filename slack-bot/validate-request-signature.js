import crypto from 'crypto';

export default req => new Promise(resolve => {
	const { SLACK_SIGNING_SECRET } = process.env;
	const {
		'x-slack-request-timestamp': timestamp,
		'x-slack-signature': signature,
	} = req.headers || {};
	if (!timestamp || !signature) resolve(false);
	let rawBody = '';
	req.setEncoding('utf-8')
		.on('data', data => { rawBody += data; })
		.on('end', () => {
			const hmac = crypto.createHmac('sha256', SLACK_SIGNING_SECRET)
				.update(`v0:${timestamp}:${rawBody}`)
				.digest('hex');
			resolve(`v0=${hmac}` === signature);
		});
});
