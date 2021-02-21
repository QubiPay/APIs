interface ServerResponse {
	/** Indicates whether the request was successful */
	success: boolean,
	/** API response message */
	message: any
}

interface PaymentOptions {
	/** Payment identifier */
	id: number | string,
	/** Payment method */
	method: string?,
	/** Amount of payment */
	amount: number,
	/** Payment description */
	description: string,
	/** Redirect URL after successful transaction */
	successURL: string?,
	/** Redirect URL after failed transaction */
	failURL: string?,
	/** Value for both successURL and failURL */
	resultURL: string?
}

interface CreatePaymentResponse extends ServerResponse {
	/** Redirect URL if request was successful */
	message: string
}

export class QubiPay {
	/** Merchant identifier */
	merchantID: string;
	/** Merchant secret key */
	secret: string;
	/** Is testing mode enabled */
	testMode: boolean;
	/** Authorization header (automatically generated) */
	authSign: string;

	/**
	 * @param merchantID Merchant identifier
	 * @param secret Merchant secret key
	 */
	constructor (merchantID: string, secret: string);

	/** Create payment with options and get payment URL */
	createPayment (options: PaymentOptions): Promise<CreatePaymentResponse>;

	/**
	 * Manually send request to gateway API
	 * @param path API endpoint
	 * @param payload Optional request payload
	 */
	sendRequest (path: string, payload: any?): Promise<ServerResponse>;
}

export = QubiPay
export default QubiPay
