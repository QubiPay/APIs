const http = require('https');

const VERSION = '1.0';
const BASE_URL = 'https://gateway.qubipay.io/api/v1';

const os = require('os');
const USER_AGENT = `QubiPay/${VERSION} NodeJS/${process.versions.node} (${os.type()}/${os.release()})`;

class QubiPay {
	constructor (merchantID, secret) {
		this.merchantID = merchantID;
		this.secret = secret;
		this.testMode = false;

		this.authSign = 'Basic ' + Buffer.from(merchantID + ':' + secret).toString('base64');
	}

	createPayment (options) {
		options.amount = parseFloat(options.amount);
		return this.sendRequest('payments/create', options);
	}

	createPayment (options) {
		options.amount = parseFloat(options.amount);
		return this.sendRequest('payments/create', options);
	}

	sendRequest (path, payload) {
		path = BASE_URL + '/' + path;
		if (this.testMode) {
			path += '?test';
		}

		function handleResponse (res, resolve) {
			let body = '';
			res.on('data', chunk => body += chunk.toString());
			res.on('end', () => {
				try {
					resolve({
						message: JSON.parse(body),
						success: res.statusCode < 400
					});
				} catch {
					resolve({
						message: body,
						success: res.statusCode < 400
					});
				}
			});
		}

		if (payload) {
			payload = Buffer.from(JSON.stringify(payload));

			return new Promise(resolve => {
				const req = http.request(path, {
					method: 'POST',
					headers: {
						Authorization: this.authSign,
						'Content-Type': 'application/json',
						'Content-Length': payload.length,
						'User-Agent': USER_AGENT
					}
				}, res => {
					handleResponse(res, resolve);
				});

				req.on('error', err => {
					resolve({ success: false, message: err.toString() });
				});
				req.write(payload);
				req.end();
			});
		} else {
			return new Promise(resolve => {
				const req = http.request(path, {
					method: 'GET',
					headers: {
						Authorization: this.authSign,
						'User-Agent': USER_AGENT
					}
				}, res => {
					handleResponse(res, resolve);
				});

				req.on('error', err => {
					resolve({ success: false, message: err.toString() });
				});
				req.end();
			});
		}
	}
}

module.exports = QubiPay;
module.exports.QubiPay = QubiPay;
