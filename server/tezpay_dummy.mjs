import process_receipt_message from "./receipt.mjs";

class Tezpay {
	constructor({ receiver_address }) {
		this.receiver_address = receiver_address;
	}

 	async init_payment({ external_id, tez_amount }) {
 		let payment_description = {
 			external_id,
 			tez_amount,
 			receiver_address: this.receiver_address,
			message: `Payment id: ${external_id}` };
		console.log("Payment info recorded:\n", payment_description);
 		return payment_description;
 	}

	async process_receipt(receipt_message) {
		let parsed_receipt = process_receipt_message(receipt_message);
		console.log("Payment receipt received:\n", parsed_receipt);
		return true;
	}

	async is_payment_confirmed(external_id, block_confirmations) {
		return true;
	}
}

let tp = new Tezpay({ receiver_address: "" })