import DA from "./data_access.mjs";

class Tezpay {
	constructor({ paypoint_schema_name, db_pool, block_confirmations }) {
		this.da = DA({ db: db_pool, paypoint_schema_name });
		this.block_confirmations = block_confirmations;
	}

 	async init_payment({ external_id, mutez_amount }) {
		if (!this.receiver_address) {
			this.receiver_address = await this.da.get_paypoint_address();
			console.log("Paypoint address queried: ", this.receiver_address);
		}
 		let payment_description = {
 			external_id,
 			mutez_amount,
 			receiver_address: this.receiver_address,
			message: external_id };
 		await this.da.save_payment(payment_description);
 		return payment_description;
 	}

	async get_payment(external_id) {
		let [ payment_data, fulfillments ] = await Promise.all([
			this.da.get_payment({ external_id }),
			this.da.get_fulfillments({
				message: external_id,
				block_confirmations: this.block_confirmations
			})
		]);

		let mutez_paid = (fulfillments.length > 0) ? fulfillments.map(i=>i.amount).reduce((a,b)=>a+b) : 0;
		let is_paid_in_full = (mutez_paid >= payment_data.mutez_amount);

		return {
			payment_data,
			fulfillments,
			mutez_paid,
			is_paid_in_full
		};
	}

}

export default Tezpay;