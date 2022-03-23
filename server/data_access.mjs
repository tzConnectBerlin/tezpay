
const SAVE_PAYMENT_SQL = "INSERT INTO tezpay.payments (external_id, mutez_amount, receiver_address) VALUES ($1, $2, $3)";
const GET_PAYMENT_SQL = "SELECT * FROM tezpay.payments WHERE external_id = $1";
const GET_FULFILLMENTS_SQL = "SELECT "

const save_payment = function(db, {external_id, mutez_amount, receiver_address}) {
	return db.query(SAVE_PAYMENT_SQL, [external_id, mutez_amount, receiver_address]);
};

const get_payment = async function(db, { external_id }) {
	let result = await db.query(GET_PAYMENT_SQL, [ external_id ]);
	return result.rows[0];
};

const get_fulfillments = async function (db, { message, max_block_height }) {
	// FIXME
	return [];
}

export default {
	save_payment,
	get_payment,
	get_fulfillments
};