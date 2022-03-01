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

	async process_receipt(receipt_message) {
		let parsed_receipt = process_receipt_message(receipt_message);
		await da.save_receipt(this.db_pool, parsed_receipt);
		return true;
	}

	async is_payment_confirmed(external_id, safe_block_height) {
		let confirmation_result = await da.get_confirmed(this.db_pool, { external_id, safe_block_height });
		if (confirmation_result.length == 0) {
			return false;
		}
		let confirmation = confirmation_result[0];
		let double_claim_detector = await da.get_claim_count(this.db_pool, confirmation.opg_hash);
		if (double_claim_detector.count != 1) {
			// DOUBLE CLAIMED PAYMENT! SOME KIND OF RED FLAG IS NEEDED
			return false;
		}
		return confirmation;
	}

}

