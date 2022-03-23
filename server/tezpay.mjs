import process_receipt_message from "./receipt.mjs";
import da from "./data_access.mjs";

class Tezpay {
	constructor({ receiver_address, db_pool }) {
		this.receiver_address = receiver_address;
		this.db_pool = db_pool;
	}

 	async init_payment({ external_id, tez_amount }) {
 		let payment_description = {
 			external_id,
 			tez_amount,
 			receiver_address: this.receiver_address,
			message: `Payment id: ${external_id}` };
 		await da.save_payment(this.db_pool, payment_description);
 		return payment_description;
 	}

	async get_payment(external_id, safe_block_height) {
		let [ payment_data, fulfillments ] = await Promise.all([
			da.get_payment(this.db_pool, { external_id }),
			da.get_fulfillments(this.db_pool, {
				external_id,
				below_block_height: safe_block_height,
				schema: this.receiver_address
			})
		]);
		return {
			payment_data,
			fulfillments
		};
	}

}

