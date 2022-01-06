import { bytes2Char, getPkhfromPk, verifySignature } from "@taquito/utils"

// const test_message = {
// 	"payload": "0501000000e554657a6f73205369676e6564204d6573736167653a206578616d706c652e636f6d20323032322d30312d30355431353a34343a31332e3837325a205061796d656e7420736c697020666f7220302e31352074657a20746f20747a335a68733264796772353579487951794b6a6e7441745939626766684c5a34586a312077697468206d65737361676520275061796d656e74206e6f2e20313030362720616e64206f6e2d636861696e206c6f6361746f72206f6f416e7644556e676f68315068594247663666707436516831636a776f585131514573387372426434327367715668775174",
// 	"signature": "edsigu1WES5HVhWzNoDXQoyQQn3yRNK9BgtrW1eizeQVmzQhVmBGr4M7NXjABCin1KjkvD9EmQfreEs1sQhNvPPntYU8UwhCgX6",
// 	"public_key": "edpktzBQbDNyWNkvMLHutm9EvnCxbiPsaJv25NYkTuE1cAi1owyz93"
// }

export class ValidationError extends Error { }

const receipt_regex = /^Tezos Signed Message: (.+) ([0-9TZ\-+\.:]+) Payment slip for ([0-9.]+) tez to (tz[0-9a-zA-Z]{34}) with message '(.+)' and on-chain locator (oo[0-9a-zA-Z]{49}[0-9.]*)$/
const payment_id_regex = /^Payment id: ([0-9a-f\-]+)$/

const parse_payment_id = function(message) {
	let parse_result = message.match(payment_id_regex);
	if (parse_result) {
		return parse_result[1];
	} else {
		throw new ValidationError("Could not parse payment identifier.")
	}
};

const parse_receipt = function(receipt) {
	let parse_result = receipt.match(receipt_regex);
	if (parse_result) {
		return {
			dapp_uri: parse_result[1],
			timestamp: parse_result[2],
			tez_amount: parse_result[3],
			to_address: parse_result[4],
			message: parse_result[5],
			operation: parse_result[6]
		};
	} else {
		throw new ValidationError("Could not parse payload.");
	}
};

const parse_payload = function(payload) {
	let hex_receipt = payload.substring(12);
	let receipt = bytes2Char(hex_receipt);
	return receipt;
};

const validate_signature = function({ payload, signature, public_key }) {
	return verifySignature( payload, public_key, signature );
};

export default async function process_receipt_message(receipt_message) {
	if (!validate_signature(receipt_message)) {
		throw new ValidationError("Invalid signature.")
	}

	let receipt_string = parse_payload(receipt_message.payload);
	let parsed_receipt = parse_receipt(receipt_string);
	parsed_receipt.payment_id = parse_payment_id(parsed_receipt.message);
	parsed_receipt.signed_by = getPkhfromPk(receipt_message.public_key);

	return parsed_receipt;
}
