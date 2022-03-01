
const SAVE_PAYMENT_SQL = "INSERT INTO tezpay.payments (external_id, mutez_amount, receiver_address) VALUES ($1, $2, $3)"
const SAVE_RECEIPT_SQL = "INSERT INTO tezpay.receipts (payment_id, mutez_amount, receiver_address, opg_hash, signed_by_address) VALUES ($1, $2, $3, $4, $5)";

const GET_CONFIRMED_SQL = "SELECT \
		receipts.id AS id,\
		receipts.opg_hash AS opg_hash\
	FROM tezpay.payments AS payments\
	INNER JOIN tezpay.receipts AS receipts\
		ON payments.payment_id = receipts.payment_id\
		AND payments.receiver_id = receipts.receiver_id\
		AND payments.mutez_amount = receipts.mutez_amount\
	INNER JOIN transfers.transfers AS transfers\
		ON transfers.opg = receipts.opg_hash\
		AND transfers.source = receipts.signed_by_address\
		AND transfers.destination = receipts.receiver_id \
		AND transfers.amount = receipts.mutez_amount\
	WHERE receipts.payment_id = $1 AND transfers.block_height < $2"

const GET_CLAIM_COUNT_SQL = "SELECT\
	COUNT(1) AS count\
	FROM tezpay.payments AS payments\
	INNER JOIN tezpay.receipts AS receipts\
		ON payments.payment_id = receipts.payment_id\
		AND payments.receiver_id = receipts.receiver_id\
		AND payments.mutez_amount = receipts.mutez_amount\
	INNER JOIN transfers.transfers AS transfers\
		ON transfers.opg = receipts.opg_hash\
		AND transfers.source = receipts.signed_by_address\
		AND transfers.destination = receipts.receiver_id \
		AND transfers.amount = receipts.mutez_amount\
	WHERE transfers.opg = $1"

const save_payment = function(db, {external_id, mutez_amount, receiver_address}) {
	return db.query(SAVE_PAYMENT_SQL, [external_id, mutez_amount, receiver_address]);
};

const save_receipt = function(db, {payment_id, mutez_amount, receiver_address, opg_hash, signed_by_address}) {
	return db.query(SAVE_RECEIPT_SQL, [payment_id, mutez_amount, receiver_address, opg_hash, signed_by_address]);
};

const get_confirmed = async function(db, {payment_id, safe_block_height}) {
	let result = await db.query(GET_CONFIRMED_SQL, [payment_id, safe_block_height]);
	return result.rows;
};

const get_claim_count = async function(db, opg_hash) {
	let result = await db.query(GET_CLAIM_COUNT_SQL, [opg_hash]);
	return result.rows[0];
};

export default {
	save_payment,
	save_receipt,
	get_confirmed,
	get_claim_count
};