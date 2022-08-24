const GET_CONTRACT_ADDRESS = "SELECT address FROM que_pasa.contracts WHERE name = $1";
const SAVE_PAYMENT_SQL = "INSERT INTO tezpay.payments (external_id, mutez_amount, receiver_address) VALUES ($1, $2, $3)";
const CANCEL_PAYMENT_SQL = "UPDATE tezpay.payments SET is_cancelled = TRUE WHERE external_id = $1";
const GET_PAYMENT_SQL = "SELECT * FROM tezpay.payments WHERE external_id = $1";

export default function({db, paypoint_schema_name}) {
	let GET_FULFILLMENTS_SQL = `
SELECT
  tx_contexts.level,
  txs.operation_hash,
  txs.amount,
  entries.msg as message
FROM (
  SELECT
    tx_context_id,
    string AS msg
  FROM ${paypoint_schema_name}."entry.pay"

  UNION ALL

  SELECT
    tx_context_id,
    pay AS msg
  FROM ${paypoint_schema_name}."entry.default"
) AS entries
INNER JOIN que_pasa.tx_contexts AS tx_contexts
  ON tx_contexts.id = entries.tx_context_id
INNER JOIN que_pasa.txs AS txs
  ON txs.tx_context_id = entries.tx_context_id
WHERE entries.msg = $1
  AND tx_contexts.level < (SELECT max(level) FROM que_pasa.levels) - $2`;

	const get_paypoint_address = async function() {
		let result = await db.query(GET_CONTRACT_ADDRESS, [paypoint_schema_name]);
		return result.rows[0].address;
	};

	const save_payment = function({external_id, mutez_amount, receiver_address}) {
		return db.query(SAVE_PAYMENT_SQL, [external_id, mutez_amount, receiver_address]);
	};

	const cancel_payment = function({ external_id }) {
		return db.query(CANCEL_PAYMENT_SQL, [external_id]);
	}

	const get_payment = async function({ external_id }) {
		let result = (await db.query(GET_PAYMENT_SQL, [external_id])).rows[0];
		result.mutez_amount = BigInt(result.mutez_amount);
		return result;
	};

	const get_fulfillments = async function ({ message, block_confirmations }) {
		let result = await db.query(GET_FULFILLMENTS_SQL, [message, block_confirmations])
		return result.rows.map(row => {
			row.amount = BigInt(row.amount);
			return row;
		});
	}

	return {
		get_paypoint_address,
		save_payment,
		cancel_payment,
		get_payment,
		get_fulfillments
	};
};
